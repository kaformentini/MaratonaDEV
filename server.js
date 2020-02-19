const express = require("express") // requerimento do arquivo express 
const server = express() // constante/variavel server roda o express

//config arq estaticos(imagens, .js, css, scripts)
server.use(express.static('public'))

// habilitar corpo do formulário
server.use(express.urlencoded({ extended: true}))

const Pool = require('pg').Pool
const db = new Pool({
    user: 'postgres',
    password: 'pqxodc',
    host: 'localhost',
    port: 5432,
    database: 'blood_donation'
})

// config tamplate engine com nunjucks
const nunjucks = require("nunjucks")
nunjucks.configure("./", {
    express: server,
    noCache: true,
})


server.get("/", function(request, response) {
    db.query("SELECT * FROM donors ORDER BY id DESC LIMIT 4", function(error, result) {
        if (error) return response.send("Erro de leitura do banco")
        
        const donors = result.rows
        return response.render("index.html", { donors })
    })
})

server.post("/", function(request, response) {
    //pega dados do formulário
    const name = request.body.name
    const blood_type = request.body.blood_type
    const email = request.body.email

    if (name == "" || blood_type == "" || email == "") { 
        return response.send("Todos os campos são obrigatórios.")
    }

    //add valores no db data base
    const query = `
        INSERT INTO donors ("name", "blood_type", "email") 
        VALUES ($1, $2, $3)`
        
    const values = [name, blood_type, email]

    db.query(query, values, function(error) {
        if (error) {
            console.log(error)
            return response.send("Erro no banco de dados")
        }
        return response.redirect("/")
    })
})

server.listen(3000, function() {
    console.log("iniciei o servidor")
}) //porta 3000 do servidor