
import { describe, expect, test } from 'vitest'
import { DatabaseManager, InstanceDatabase } from '../../database/manager'



describe('[Database: DatabaseManager]', () => {
    test('should returns instance', async () => {
        const ins = DatabaseManager.instance();
        // @ts-ignore
        expect(ins instanceof DatabaseManager).toBeTruthy();
    });
    // describe('Function: { init }', () => {
 
    // });
})

describe('[Database: InstanceDatabase]', () => {
    test('should returns instance', async () => {
        const ins = new InstanceDatabase('materials');
        // @ts-ignore
        expect(ins instanceof InstanceDatabase).toBeTruthy();
        expect(ins.dbname === 'materials');
    });
    test('should throw error. is none dbname', () => {
        // @ts-ignore
        expect(() => new InstanceDatabase())
            .toThrow(/^InstanceDatabase > constructor: dbname is a required$/);
    })

    // describe('Function: { init }', () => {
 
    // });
})
