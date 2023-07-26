DELETE FROM appointments;
DELETE FROM transactions;
DELETE FROM cases;
DELETE FROM patients;
DELETE FROM dollar_price;
UPDATE sqlite_sequence SET seq = 0;
COMMIT;