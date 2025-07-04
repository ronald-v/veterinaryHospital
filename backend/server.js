const express = require("express")
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "veterinary_clinic",
}

// Crear conexión a la base de datos
const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error("Error conectando a la base de datos:", error)
    throw error
  }
}

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token de acceso requerido" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" })
    }
    req.user = user
    next()
  })
}

// Rutas de autenticación
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body
    const connection = await createConnection()

    // Verificar si el usuario ya existe
    const [existingUsers] = await connection.execute("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      await connection.end()
      return res.status(400).json({ message: "El usuario ya existe" })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const [result] = await connection.execute(
      "INSERT INTO users (email, password, name, phone, address) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, name, phone, address],
    )

    await connection.end()

    res.status(201).json({
      message: "Usuario creado exitosamente",
      userId: result.insertId,
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const connection = await createConnection()

    // Buscar usuario
    const [users] = await connection.execute("SELECT id, email, password, name FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      await connection.end()
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    const user = users[0]

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      await connection.end()
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    // Generar token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "secret_key", {
      expiresIn: "24h",
    })

    await connection.end()

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Rutas de mascotas
app.get("/api/pets", authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection()
    const [pets] = await connection.execute("SELECT * FROM pets WHERE owner_id = ? ORDER BY created_at DESC", [
      req.user.userId,
    ])
    await connection.end()
    res.json(pets)
  } catch (error) {
    console.error("Error obteniendo mascotas:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

app.post("/api/pets", authenticateToken, async (req, res) => {
  try {
    const { name, type, size, breed, age, weight } = req.body
    const connection = await createConnection()

    const [result] = await connection.execute(
      "INSERT INTO pets (owner_id, name, type, size, breed, age, weight) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.userId, name, type, size, breed, age, weight],
    )

    await connection.end()
    res.status(201).json({ message: "Mascota creada exitosamente", petId: result.insertId })
  } catch (error) {
    console.error("Error creando mascota:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Rutas de registros médicos
app.get("/api/pets/:petId/medical-records", authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection()
    const [records] = await connection.execute(
      `SELECT mr.* FROM medical_records mr 
       JOIN pets p ON mr.pet_id = p.id 
       WHERE p.id = ? AND p.owner_id = ? 
       ORDER BY mr.created_at DESC`,
      [req.params.petId, req.user.userId],
    )
    await connection.end()
    res.json(records)
  } catch (error) {
    console.error("Error obteniendo registros médicos:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

app.post("/api/pets/:petId/medical-records", authenticateToken, async (req, res) => {
  try {
    const { description, diagnosis, treatment, notes } = req.body
    const connection = await createConnection()

    // Verificar que la mascota pertenece al usuario
    const [pets] = await connection.execute("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [
      req.params.petId,
      req.user.userId,
    ])

    if (pets.length === 0) {
      await connection.end()
      return res.status(404).json({ message: "Mascota no encontrada" })
    }

    const [result] = await connection.execute(
      "INSERT INTO medical_records (pet_id, description, diagnosis, treatment, notes) VALUES (?, ?, ?, ?, ?)",
      [req.params.petId, description, diagnosis, treatment, notes],
    )

    await connection.end()
    res.status(201).json({ message: "Registro médico creado exitosamente", recordId: result.insertId })
  } catch (error) {
    console.error("Error creando registro médico:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Rutas de vacunaciones
app.get("/api/pets/:petId/vaccinations", authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection()
    const [vaccinations] = await connection.execute(
      `SELECT v.* FROM vaccinations v 
       JOIN pets p ON v.pet_id = p.id 
       WHERE p.id = ? AND p.owner_id = ? 
       ORDER BY v.date DESC`,
      [req.params.petId, req.user.userId],
    )
    await connection.end()
    res.json(vaccinations)
  } catch (error) {
    console.error("Error obteniendo vacunaciones:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

app.post("/api/pets/:petId/vaccinations", authenticateToken, async (req, res) => {
  try {
    const { vaccination_number, type, date, next_due_date, veterinarian, notes } = req.body
    const connection = await createConnection()

    // Verificar que la mascota pertenece al usuario
    const [pets] = await connection.execute("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [
      req.params.petId,
      req.user.userId,
    ])

    if (pets.length === 0) {
      await connection.end()
      return res.status(404).json({ message: "Mascota no encontrada" })
    }

    const [result] = await connection.execute(
      "INSERT INTO vaccinations (pet_id, vaccination_number, type, date, next_due_date, veterinarian, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.params.petId, vaccination_number, type, date, next_due_date, veterinarian, notes],
    )

    await connection.end()
    res.status(201).json({ message: "Vacunación registrada exitosamente", vaccinationId: result.insertId })
  } catch (error) {
    console.error("Error registrando vacunación:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Rutas de servicios
app.get("/api/services", async (req, res) => {
  try {
    const connection = await createConnection()
    const [services] = await connection.execute("SELECT * FROM services WHERE active = TRUE ORDER BY category, name")
    await connection.end()
    res.json(services)
  } catch (error) {
    console.error("Error obteniendo servicios:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Rutas de citas
app.get("/api/appointments", authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection()
    const [appointments] = await connection.execute(
      `SELECT a.*, p.name as pet_name, s.name as service_name, s.category 
       FROM appointments a 
       JOIN pets p ON a.pet_id = p.id 
       JOIN services s ON a.service_id = s.id 
       WHERE p.owner_id = ? 
       ORDER BY a.appointment_date DESC`,
      [req.user.userId],
    )
    await connection.end()
    res.json(appointments)
  } catch (error) {
    console.error("Error obteniendo citas:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

app.post("/api/appointments", authenticateToken, async (req, res) => {
  try {
    const { pet_id, service_id, appointment_date, notes } = req.body
    const connection = await createConnection()

    // Verificar que la mascota pertenece al usuario
    const [pets] = await connection.execute("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [
      pet_id,
      req.user.userId,
    ])

    if (pets.length === 0) {
      await connection.end()
      return res.status(404).json({ message: "Mascota no encontrada" })
    }

    // Obtener precio del servicio
    const [services] = await connection.execute("SELECT price FROM services WHERE id = ?", [service_id])

    const total_cost = services.length > 0 ? services[0].price : 0

    const [result] = await connection.execute(
      "INSERT INTO appointments (pet_id, service_id, appointment_date, notes, total_cost) VALUES (?, ?, ?, ?, ?)",
      [pet_id, service_id, appointment_date, notes, total_cost],
    )

    await connection.end()
    res.status(201).json({ message: "Cita creada exitosamente", appointmentId: result.insertId })
  } catch (error) {
    console.error("Error creando cita:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Rutas de productos de la tienda
app.get("/api/shop/products", async (req, res) => {
  try {
    const connection = await createConnection()
    const [products] = await connection.execute(
      "SELECT * FROM shop_products WHERE active = TRUE ORDER BY category, name",
    )
    await connection.end()
    res.json(products)
  } catch (error) {
    console.error("Error obteniendo productos:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`)
})
