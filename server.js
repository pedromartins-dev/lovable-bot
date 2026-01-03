const express = require('express');
const { spawn } = require('child_process');
const app = express();
const PORT = 3000;

app.use(express.json());

function runScript(scriptName, args) {
    return new Promise((resolve, reject) => {
        console.log(`[Server] Preparando ${scriptName} com args: ${args}`);
        
        const child = spawn('node', [scriptName, ...args], { 
            shell: false, 
            stdio: 'pipe' 
        });

        let output = '';

        child.stdout.on('data', (data) => {
            const texto = data.toString();
            console.log(`[${scriptName}]: ${texto.trim()}`);
            output += texto;
        });

        child.stderr.on('data', (data) => {
            console.error(`[Erro ${scriptName}]: ${data.toString().trim()}`);
        });

        child.on('close', (code) => {
            if (code === 0) resolve(output);
            else reject(`Saiu com código ${code}`);
        });
        
        child.on('error', (err) => reject(err.message));
    });
}

// ROTA 1: CADASTRO
app.post('/signup', async (req, res) => {
    const { invite_link, email } = req.body;
    if (!invite_link || !email) return res.status(400).send('Dados incompletos');
    try {
        await runScript('signup.js', [invite_link, email]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.toString() }); }
});

// ROTA 2: PUBLICAR (ATUALIZADA PARA RECEBER EMAIL)
app.post('/publish', async (req, res) => {
    const { verification_link, email } = req.body; // <--- AGORA RECEBE EMAIL

    console.log("\n--- PEDIDO DE PUBLICAÇÃO ---");
    console.log("Link:", verification_link);
    console.log("Conta:", email);

    if (!verification_link || !email) return res.status(400).send('Falta link ou email');

    try {
        // Passamos o link E o email para o script
        await runScript('publish.js', [verification_link, email]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.toString() }); }
});

app.listen(PORT, () => {
    console.log(`🚀 Server pronto na porta ${PORT}`);
});