# UUID

I want to migrate eveything from int ids into UUIDs

- Every table that contains int ID should be migrated into UUIDs
- Clean all the data in all tables before running this migration
- I don't need the current data in the database
- From now and on, every new id should be an UUID
- Update necessary endpoints to insert/use UUIDs intead of sequencial ids 