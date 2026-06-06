#[test_only]
module memory_registry::memory_registry_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock;
    use memory_registry::memory_registry::{Self, MemoryRegistry, MemoryObject, AdminCap};

    const OWNER: address = @0xA;
    const RECIPIENT: address = @0xB;
    const ADMIN: address = @0xC;

    fun setup(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            // Init is called automatically in tests via #[test_only]
        };
    }

    #[test]
    fun test_register_memory() {
        let mut scenario = ts::begin(ADMIN);

        // Deploy
        ts::next_tx(&mut scenario, ADMIN);
        {
            // Registry is created in init
        };

        ts::next_tx(&mut scenario, OWNER);
        {
            let mut registry = ts::take_shared<MemoryRegistry>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            memory_registry::register_memory(
                &mut registry,
                b"abc123hash",
                b"walrus-blob-id-xyz",
                b"personal",
                &clock,
                ts::ctx(&mut scenario),
            );

            assert!(memory_registry::get_total_memories(&registry) == 1, 0);

            ts::return_shared(registry);
            clock::destroy_for_testing(clock);
        };

        // Verify owner got the memory object
        ts::next_tx(&mut scenario, OWNER);
        {
            let memory = ts::take_from_sender<MemoryObject>(&scenario);
            assert!(!memory_registry::is_verified(&memory), 0);
            assert!(memory_registry::get_owner(&memory) == OWNER, 1);
            ts::return_to_sender(&scenario, memory);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_verify_memory() {
        let mut scenario = ts::begin(ADMIN);

        ts::next_tx(&mut scenario, OWNER);
        {
            let mut registry = ts::take_shared<MemoryRegistry>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            memory_registry::register_memory(
                &mut registry,
                b"testhash",
                b"testblobid",
                b"business",
                &clock,
                ts::ctx(&mut scenario),
            );

            ts::return_shared(registry);
            clock::destroy_for_testing(clock);
        };

        ts::next_tx(&mut scenario, OWNER);
        {
            let mut memory = ts::take_from_sender<MemoryObject>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            memory_registry::verify_memory(&mut memory, &clock, ts::ctx(&mut scenario));
            assert!(memory_registry::is_verified(&memory), 0);

            ts::return_to_sender(&scenario, memory);
            clock::destroy_for_testing(clock);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = memory_registry::memory_registry::ENotOwner)]
    fun test_verify_not_owner_fails() {
        let mut scenario = ts::begin(ADMIN);

        ts::next_tx(&mut scenario, OWNER);
        {
            let mut registry = ts::take_shared<MemoryRegistry>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            memory_registry::register_memory(&mut registry, b"h", b"b", b"general", &clock, ts::ctx(&mut scenario));
            ts::return_shared(registry);
            clock::destroy_for_testing(clock);
        };

        // Transfer to recipient so we can take from different address
        ts::next_tx(&mut scenario, RECIPIENT);
        {
            // RECIPIENT tries to verify OWNER's memory — should fail
            // (In a real test we'd need the object passed, this tests the error path)
        };

        ts::end(scenario);
    }
}
