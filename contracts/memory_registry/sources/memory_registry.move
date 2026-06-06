/// MemoryChain AI — Memory Registry Contract
/// Registers AI memory ownership and Walrus storage references on Sui blockchain.
module memory_registry::memory_registry {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};

    // ─── Errors ───────────────────────────────────────────────────────────────

    const ENotOwner: u64 = 0;
    const EInvalidHash: u64 = 1;
    const EAlreadyVerified: u64 = 2;

    // ─── Structs ──────────────────────────────────────────────────────────────

    /// Represents a single stored memory with its Walrus reference.
    /// Owned by the user's wallet address.
    public struct MemoryObject has key, store {
        id: UID,
        /// SHA-256 hash of the memory content for integrity verification
        content_hash: String,
        /// Walrus blob ID where full memory content is stored
        walrus_blob_id: String,
        /// Memory category tag (personal, business, preferences, etc.)
        category: String,
        /// Timestamp when memory was registered (milliseconds since epoch)
        created_at: u64,
        /// Original owner address
        owner: address,
        /// Whether this memory has been explicitly verified
        verified: bool,
    }

    /// Registry shared object tracking global memory statistics.
    public struct MemoryRegistry has key {
        id: UID,
        total_memories: u64,
        admin: address,
    }

    /// Capability object for the registry admin.
    public struct AdminCap has key, store {
        id: UID,
    }

    // ─── Events ───────────────────────────────────────────────────────────────

    public struct MemoryRegistered has copy, drop {
        memory_id: address,
        owner: address,
        content_hash: String,
        walrus_blob_id: String,
        category: String,
        timestamp: u64,
    }

    public struct MemoryVerified has copy, drop {
        memory_id: address,
        owner: address,
        timestamp: u64,
    }

    public struct MemoryTransferred has copy, drop {
        memory_id: address,
        from: address,
        to: address,
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    fun init(ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);

        // Create shared registry
        let registry = MemoryRegistry {
            id: object::new(ctx),
            total_memories: 0,
            admin,
        };
        transfer::share_object(registry);

        // Give deployer admin cap
        let admin_cap = AdminCap { id: object::new(ctx) };
        transfer::transfer(admin_cap, admin);
    }

    // ─── Public Entry Functions ───────────────────────────────────────────────

    /// Register a new memory. Creates a MemoryObject owned by the caller.
    public entry fun register_memory(
        registry: &mut MemoryRegistry,
        content_hash: vector<u8>,
        walrus_blob_id: vector<u8>,
        category: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let owner = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        let memory = MemoryObject {
            id: object::new(ctx),
            content_hash: string::utf8(content_hash),
            walrus_blob_id: string::utf8(walrus_blob_id),
            category: string::utf8(category),
            created_at: timestamp,
            owner,
            verified: false,
        };

        let memory_id = object::uid_to_address(&memory.id);

        // Emit event
        event::emit(MemoryRegistered {
            memory_id,
            owner,
            content_hash: memory.content_hash,
            walrus_blob_id: memory.walrus_blob_id,
            category: memory.category,
            timestamp,
        });

        // Update registry stats
        registry.total_memories = registry.total_memories + 1;

        // Transfer ownership to caller
        transfer::transfer(memory, owner);
    }

    /// Mark a memory as verified (self-verification by owner).
    public entry fun verify_memory(
        memory: &mut MemoryObject,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(memory.owner == sender, ENotOwner);
        assert!(!memory.verified, EAlreadyVerified);

        memory.verified = true;

        event::emit(MemoryVerified {
            memory_id: object::uid_to_address(&memory.id),
            owner: sender,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Transfer a memory object to another address.
    public entry fun transfer_memory(
        memory: MemoryObject,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(memory.owner == sender, ENotOwner);

        event::emit(MemoryTransferred {
            memory_id: object::uid_to_address(&memory.id),
            from: sender,
            to: recipient,
        });

        transfer::transfer(memory, recipient);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    public fun get_content_hash(memory: &MemoryObject): &String {
        &memory.content_hash
    }

    public fun get_walrus_blob_id(memory: &MemoryObject): &String {
        &memory.walrus_blob_id
    }

    public fun get_category(memory: &MemoryObject): &String {
        &memory.category
    }

    public fun get_owner(memory: &MemoryObject): address {
        memory.owner
    }

    public fun is_verified(memory: &MemoryObject): bool {
        memory.verified
    }

    public fun get_created_at(memory: &MemoryObject): u64 {
        memory.created_at
    }

    public fun get_total_memories(registry: &MemoryRegistry): u64 {
        registry.total_memories
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    /// Admin can verify any memory (for moderation/trusted verification).
    public entry fun admin_verify_memory(
        _: &AdminCap,
        memory: &mut MemoryObject,
        clock: &Clock,
    ) {
        memory.verified = true;

        event::emit(MemoryVerified {
            memory_id: object::uid_to_address(&memory.id),
            owner: memory.owner,
            timestamp: clock::timestamp_ms(clock),
        });
    }
}
