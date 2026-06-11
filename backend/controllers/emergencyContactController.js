import pool from '../config/db.js';

// GET /api/users/emergency-contacts
export const getEmergencyContacts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, relationship, phone, created_at, updated_at 
             FROM emergency_contacts 
             WHERE user_id = $1 
             ORDER BY created_at ASC`,
            [req.user.id]
        );
        return res.status(200).json({
            contacts: result.rows
        });
    } catch (err) {
        console.error('getEmergencyContacts error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/users/emergency-contacts
export const addEmergencyContact = async (req, res) => {
    try {
        const { name, relationship, phone } = req.body;

        if (!name || !relationship || !phone) {
            return res.status(400).json({ message: 'Name, relationship, and phone number are required' });
        }

        const trimmedName = name.trim();
        const trimmedRelationship = relationship.trim();
        const trimmedPhone = phone.trim();

        if (trimmedName.length === 0 || trimmedName.length > 100) {
            return res.status(400).json({ message: 'Name must be between 1 and 100 characters' });
        }

        if (trimmedRelationship.length === 0 || trimmedRelationship.length > 50) {
            return res.status(400).json({ message: 'Relationship must be between 1 and 50 characters' });
        }

        // basic phone format validation (at least 8 digits and max 15 digits, allows optional +)
        if (!/^\+?[1-9]\d{7,14}$/.test(trimmedPhone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        const countRes = await pool.query(
            'SELECT COUNT(*) FROM emergency_contacts WHERE user_id = $1',
            [req.user.id]
        );

        if (parseInt(countRes.rows[0].count) >= 5) {
            return res.status(400).json({ message: 'Maximum of 5 emergency contacts allowed' });
        }

        const insertRes = await pool.query(
            `INSERT INTO emergency_contacts (user_id, name, relationship, phone)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, relationship, phone, created_at, updated_at`,
            [req.user.id, trimmedName, trimmedRelationship, trimmedPhone]
        );

        return res.status(201).json({
            message: 'Emergency contact added successfully',
            contact: insertRes.rows[0]
        });

    } catch (err) {
        console.error('addEmergencyContact error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/users/emergency-contacts/:id
export const updateEmergencyContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, relationship, phone } = req.body;

        if (!name || !relationship || !phone) {
            return res.status(400).json({ message: 'Name, relationship, and phone number are required' });
        }

        const trimmedName = name.trim();
        const trimmedRelationship = relationship.trim();
        const trimmedPhone = phone.trim();

        if (trimmedName.length === 0 || trimmedName.length > 100) {
            return res.status(400).json({ message: 'Name must be between 1 and 100 characters' });
        }

        if (trimmedRelationship.length === 0 || trimmedRelationship.length > 50) {
            return res.status(400).json({ message: 'Relationship must be between 1 and 50 characters' });
        }

        if (!/^\+?[1-9]\d{7,14}$/.test(trimmedPhone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        // check ownership
        const contactCheck = await pool.query(
            'SELECT id FROM emergency_contacts WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (contactCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Emergency contact not found' });
        }

        const updateRes = await pool.query(
            `UPDATE emergency_contacts
             SET name = $1, relationship = $2, phone = $3, updated_at = NOW()
             WHERE id = $4
             RETURNING id, name, relationship, phone, created_at, updated_at`,
            [trimmedName, trimmedRelationship, trimmedPhone, id]
        );

        return res.status(200).json({
            message: 'Emergency contact updated successfully',
            contact: updateRes.rows[0]
        });

    } catch (err) {
        console.error('updateEmergencyContact error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/users/emergency-contacts/:id
export const deleteEmergencyContact = async (req, res) => {
    try {
        const { id } = req.params;

        // check ownership
        const contactCheck = await pool.query(
            'SELECT id FROM emergency_contacts WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (contactCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Emergency contact not found' });
        }

        await pool.query(
            'DELETE FROM emergency_contacts WHERE id = $1',
            [id]
        );

        return res.status(200).json({
            message: 'Emergency contact deleted successfully'
        });

    } catch (err) {
        console.error('deleteEmergencyContact error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};
