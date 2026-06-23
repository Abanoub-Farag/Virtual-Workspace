INSERT INTO users (email, first_name, last_name, password, is_active, role, created_at, updated_at)
SELECT
    CONCAT('developer', n, '@workspace.com'),
    CONCAT('DevFirst', n),
    CONCAT('DevLast', n),
    'P@ssword123',
    true,
    'ROLE_USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM generate_series(1, 50) AS n;

INSERT INTO rooms (title, description, user_id, created_at, updated_at)
SELECT
    CONCAT('Workspace Room ', n),
    CONCAT('Automated description for test room number ', n),
    u.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM generate_series(1, 50) AS n
         JOIN users u ON u.email = CONCAT('developer', n, '@workspace.com');