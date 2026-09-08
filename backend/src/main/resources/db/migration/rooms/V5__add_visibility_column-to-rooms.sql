ALTER TABLE rooms
ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC';

-- إضافة قيد (CHECK Constraint) لضمان عدم إدخال قيم خارج الـ Enum
ALTER TABLE rooms
ADD CONSTRAINT chk_rooms_visibility CHECK (visibility IN ('PUBLIC', 'PRIVATE'));