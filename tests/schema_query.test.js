const index = require('../src');

describe('schema_query', () => {
    it('should return correct for default directory', () => {
        const result = index.schema_query();
        expect(result).toEqual("SET search_path TO migration_2_test_migration");
    });

    it('should return correct for custom directory', () => {
        const result = index.schema_query("tests/fixtures/migrations-1");
        expect(result).toEqual("SET search_path TO migration_10_test_migration");
    });

    it('should return correct for multiple directories', () => {
        const result = index.schema_query("tests/fixtures/migrations-1", "tests/fixtures/migrations-2");
        expect(result).toEqual("SET search_path TO migration_10_test_migration");
    });

    it('should return correct for custom migration name', () => {
        const result = index.schema_query("tests/fixtures/custom-migration-name");
        expect(result).toEqual("SET search_path TO migration_custom_migration_name");
    });

    it('should return correct for non-existent directory', () => {
        const result = index.schema_query("tests/fixtures/non-existens");
        expect(result).toEqual('SET search_path TO "$user", public');
    });
});