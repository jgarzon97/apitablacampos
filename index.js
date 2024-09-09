const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/personas', async (req, res) => {
    const { ...fields } = req.body;

    // Extraer los nombres de los campos y sus valores
    const fieldNames = Object.keys(fields);
    const fieldValues = Object.values(fields);

    // Construir los placeholders para la consulta
    const placeholders = fieldNames.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO persona (${fieldNames.join(', ')}) VALUES (${placeholders}) RETURNING *`;

    try {
        const result = await pool.query(query, fieldValues);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener todas las personas
app.get('/personas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM persona');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener una persona por ID
app.get('/personas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM persona WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar una persona por ID
app.delete('/personas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM persona WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Persona eliminada', persona: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar una persona por ID
app.put('/personas/:id', async (req, res) => {
    const { id } = req.params;
    const { ...fields } = req.body;

    if (Object.keys(fields).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    // Extraer los nombres de los campos y sus valores
    const fieldNames = Object.keys(fields);
    const fieldValues = Object.values(fields);

    // Construir los set clauses para la consulta
    const setClauses = fieldNames.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE persona SET ${setClauses} WHERE id = $${fieldNames.length + 1} RETURNING *`;

    try {
        const result = await pool.query(query, [...fieldValues, id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Agrega un nuevo campo a la tabla persona
app.put('/personas/:id', async (req, res) => {
    const { id } = req.params;
    const { ...fields } = req.body;

    // Extraer los nombres de los campos y sus valores
    const fieldNames = Object.keys(fields);
    const fieldValues = Object.values(fields);

    // Construir los set clauses para la consulta
    const setClauses = fieldNames.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE persona SET ${setClauses} WHERE id = $${fieldNames.length + 1} RETURNING *`;

    try {
        const result = await pool.query(query, [...fieldValues, id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Eliminar una persona por ID
app.delete('/personas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM persona WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Persona eliminada', persona: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/personas/add-field', async (req, res) => {
    const { name, type } = req.body;

    let sqlType;
    switch (type) {
        case 'text':
            sqlType = 'VARCHAR(255)';
            break;
        case 'number':
            sqlType = 'INTEGER';
            break;
        case 'date':
            sqlType = 'DATE';
            break;
        default:
            return res.status(400).json({ error: 'Tipo de campo no válido' });
    }

    try {
        await pool.query(`ALTER TABLE persona ADD COLUMN ${name} ${sqlType}`);
        res.status(200).json({ message: 'Campo agregado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manejo de errores para JSON malformado
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Solicitud JSON inválida' });
    }
    next();
});

app.listen(3000, () => {
    console.log('Servidor escuchando en puerto 3000');
});