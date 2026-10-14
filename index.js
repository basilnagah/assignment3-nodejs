const fs = require('node:fs/promises')
const path = require('node:path')
const http = require('node:http')
let port = 3000
let usersFilePath = path.resolve('./users.json')

async function getAllUsers() {
    try {
        const data = await fs.readFile(usersFilePath, 'utf8')
        const allUsers = JSON.parse(data)
        return allUsers
    } catch (error) {
        console.log(error);

    }
}
async function saveUsers(data) {
    try {
        return await fs.writeFile(usersFilePath, JSON.stringify(data))

    } catch (error) {
        console.log(error);

    }
}

const httpServer = http.createServer(async (req, res) => {
    const { url, method } = req

    if (url == '/user' && method == 'POST') {
        let body = ''
        req.on('data', (chunck) => {
            body += chunck
        })
        req.on('end', async () => {
            const { name, email, age } = JSON.parse(body)
            const allUsers = await getAllUsers()
            const matchEmail = allUsers.find(ele => ele.email == email)

            if (matchEmail) {
                res.writeHead(409, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ message: "email exist" }))
            } else {
                const newUser = { id: Date.now().toString(), email, age, name }
                allUsers.push(newUser)
                saveUsers(allUsers)

                res.writeHead(200, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ message: "account created successfully" }))
            }
        })


    }
    else if (url.startsWith('/user') && method == 'PATCH') {
        const id = url.split('/')[2]
        let body = ''
        req.on('data', (chunck) => {
            body += chunck
        })
        req.on('end', async () => {
            const { name, email, age } = JSON.parse(body)
            const allUsers = await getAllUsers()
            const user = allUsers.find(ele => ele.id == id)


            if (!user) {

                res.writeHead(409, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ message: "account not found" }))
            } else {
                if (email && allUsers.some(ele => ele.email == email && ele.id != id)) {
                    res.writeHead(409, { "Content-Type": "application/json" })
                    res.end(JSON.stringify({ message: "email owned by other user" }))
                } else {
                    if (email) user.email = email
                    if (age) user.age = age
                    if (name) user.name = name
                    await saveUsers(allUsers)

                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.end(JSON.stringify({ message: "account updated successfuly", userData: user }))
                }
            }
        })


    }
    else if (url.startsWith('/user') && method == 'DELETE') {
        const id = url.split('/')[2]
        const allUsers = await getAllUsers()
        const userData = allUsers.find(ele => ele.id == id)
        if (!userData) {
            res.writeHead(409, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: "user not found" }))
        } else {
            const userIndex = allUsers.indexOf(userData)
            allUsers.splice(userIndex, 1)
            await saveUsers(allUsers)
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: "user deleted successfully", allUsers }))
        }
    }
    else if (url == '/user' && method == 'GET') {
        const allUsers = await getAllUsers()
        const count = allUsers.length
        if (!allUsers) {
            res.writeHead(500, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: "failed" }))
        } else {
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: "success", count, allUsers }))
        }
    }
    else if (url.startsWith('/user/') && method == 'GET') {
        const id = url.split('/')[2]
        const allUsers = await getAllUsers()
        const userData = allUsers.find(ele => ele.id == id)
        if (!userData) {
            res.writeHead(409, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: "user not found" }))
        } else {
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: "success", user:userData }))
        }

    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "invalid routing" }))
    }
})


httpServer.listen(port, '127.0.0.1', 511, () => {
    console.log(`listing on port ${port}`);

})

