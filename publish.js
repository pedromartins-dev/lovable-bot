// ============================================================
// 🛡️ MODIFICAÇÃO DE SEGURANÇA (STEALTH)
// ============================================================
const { chromium } = require('playwright-extra'); // Usa a versão 'extra'
const stealth = require('puppeteer-extra-plugin-stealth'); // Plugin de invisibilidade

// Ativa a camuflagem para burlar IPQS/Cloudflare
chromium.use(stealth());

// Lista de identidades (User-Agents) para parecer PCs diferentes a cada execução
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];
// ============================================================

const args = process.argv.slice(2);
const MAGIC_LINK = args[0] ? args[0].replace(/"/g, '').trim() : null;
const EMAIL = args[1] ? args[1].replace(/"/g, '').trim() : null;

function gerarDominioAleatorio() {
    const caracteres = 'abcdefghijklmnopqrstuvwxyz';
    let resultado = '';
    for (let i = 0; i < 10; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
}

if (!MAGIC_LINK || !EMAIL) {
    console.error("❌ Link ou Email faltando.");
    process.exit(1);
}

const temas = ["pet shop", "landing page startup", "cafeteria", "portfolio"];

(async () => {
  // Escolhe uma identidade aleatória para essa execução
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  console.log(`[Stealth] Identidade camuflada: ${randomUserAgent.substring(0, 50)}...`);

  // Lança o navegador com argumentos anti-detecção
  const browser = await chromium.launch({ 
      headless: false, 
      slowMo: 100,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled' // Oculta que é automação
      ]
  });

  // Cria contexto limpo com a identidade falsa
  const context = await browser.newContext({
      userAgent: randomUserAgent,
      viewport: { width: 1366, height: 768 },
      locale: 'pt-BR'
  });

  const page = await context.newPage();
  
  // Timeout geral de 4 minutos para garantir todo o processo
  page.setDefaultTimeout(240000);

  try {
    // ---------------------------------------------------------
    // 1. ACESSO E LOGIN
    // ---------------------------------------------------------
    console.log(`[Publish] 1. Acessando Link...`);
    await page.goto(MAGIC_LINK);
    await page.waitForLoadState('domcontentloaded'); 

    // ============================================================
    // ✅ MANTEVE SUA ADIÇÃO: ESPERA DE 20 SEGUNDOS
    // ============================================================
    console.log('[Info] Aguardando 20 segundos iniciais antes de prosseguir...');
    await page.waitForTimeout(20000); // 20 segundos de pausa
    // ============================================================

    console.log('[Publish] 2. Login...');
    await page.goto('https://lovable.dev/login');

    const inputEmail = await page.waitForSelector('input[type="email"]');
    await inputEmail.fill(EMAIL);
    
    try {
        await page.click('button:text-is("Continuar")');
    } catch (e) {
        await page.click('button[type="submit"]');
    }

    await page.waitForSelector('input[type="password"]', { state: 'visible' });
    await page.fill('input[type="password"]', EMAIL);
    await page.waitForTimeout(1000); 

    const loginBtn = await page.waitForSelector('button[type="submit"], button:text-is("Login"), button:text-is("Entrar")', { timeout: 5000 });
    await loginBtn.click();

    // ---------------------------------------------------------
    // 2. WORKSPACE
    // ---------------------------------------------------------
    console.log('[Publish] 3. Verificando Workspace...');
    try {
        await page.waitForTimeout(3000);
        const botoesIniciais = ['button:has-text("Create workspace")', 'button:has-text("Personal")', 'button:has-text("Lets go")', 'button:has-text("Next")'];
        for (const seletor of botoesIniciais) {
            if (await page.isVisible(seletor)) {
                await page.click(seletor);
                break; 
            }
        }
    } catch(e) {}

    // ---------------------------------------------------------
    // 3. CRIAR SITE
    // ---------------------------------------------------------
    console.log('[Publish] 4. Criando...');
    const chatInput = page.locator('textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 30000 });
    
    const tema = temas[Math.floor(Math.random() * temas.length)];
    const prompt = `Crie uma landing page simples para ${tema} em portugues. Termine em 5 segundos.`;
    
    console.log(`   Digitando prompt...`);
    await chatInput.click();
    await page.keyboard.type(prompt, { delay: 20 });
    await page.waitForTimeout(1000); 
    
    console.log('   Enviando...');
    const botaoEnviar = page.locator('button:has(svg)').last();
    if (await botaoEnviar.isVisible()) {
        await botaoEnviar.click();
    } else {
        await page.keyboard.press('Enter');
    }

    // ---------------------------------------------------------
    // 4. AGUARDAR CRIAÇÃO (2 MINUTOS)
    // ---------------------------------------------------------
    console.log('[Publish] ⏳ Aguardando 2 MINUTOS para a IA trabalhar...');
    await page.waitForTimeout(120000); // 120 segundos

    // ---------------------------------------------------------
    // 5. PUBLICAR (TÁTICA: RELATIVA AO LABEL)
    // ---------------------------------------------------------
    console.log('[Publish] 5. Publicando...');
    
    const topPublishBtn = 'button:has-text("Publish")';
    await page.waitForSelector(topPublishBtn, { state: 'visible', timeout: 90000 });
    await page.click(topPublishBtn);

    console.log('[Publish] Aguardando modal...');
    await page.waitForSelector('text="Publish your app"', { timeout: 15000 });
    await page.waitForTimeout(2000); 

    const dominioRandom = gerarDominioAleatorio();
    console.log(`   Domínio gerado: ${dominioRandom}`);

    // --- PREENCHIMENTO DO DOMÍNIO ---
    console.log('   Procurando campo ABAIXO de "Published URL"...');
    
    // Tenta clicar no Label e dar Tab (Funcionou bem)
    const label = page.locator('text="Published URL"');
    if (await label.isVisible()) {
        await label.click();
        await page.waitForTimeout(500);
        console.log('   Usando TAB para focar no campo...');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
    
        console.log('   Preenchendo...');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await page.keyboard.type(dominioRandom, { delay: 50 });
    } else {
        // Fallback: Clica no título e dá Tab
        console.log('   Label não achado, tentando via título...');
        await page.locator('text="Publish your app"').click();
        await page.keyboard.press('Tab'); // Talvez precise de mais tabs, mas o label é melhor
        await page.keyboard.type(dominioRandom, { delay: 50 });
    }

    // ---------------------------------------------------------
    // 6. SAVE E PUBLISH FINAL (Com Timeout de Segurança)
    // ---------------------------------------------------------
    console.log('   Verificando botão Save (Timeout 5s)...');
    
    // Tenta achar o Save por 5 segundos. Se não achar, segue.
    try {
        const btnSave = page.locator('button:has-text("Save")').last();
        await btnSave.waitFor({ state: 'visible', timeout: 5000 });
        await btnSave.click();
        console.log('   Save clicado. Aguardando 15s para propagar...');
        await page.waitForTimeout(15000);
    } catch (e) {
        console.log('   Botão Save não apareceu ou demorou. Seguindo para Publish Final...');
    }
    
    console.log('   Clicando em Publish Final...');
    const finalPublishBtn = page.locator('button:has-text("Publish")').last();
    await finalPublishBtn.click({ force: true });

    // ---------------------------------------------------------
    // 7. VERIFICAÇÃO DE SUCESSO E FECHAMENTO
    // ---------------------------------------------------------
    console.log('[Publish] Aguardando confirmação "You just shipped"...');
    
    try {
        // Espera a mensagem de sucesso aparecer por até 15 segundos
        await page.waitForSelector('text="You just shipped!"', { timeout: 15000 });
        console.log(`[Publish] ✅ SUCESSO CONFIRMADO!`);
    } catch (e) {
        console.log('[Publish] ⚠️ Aviso: Tela de sucesso não detectada, mas fluxo finalizado.');
    }

    // Espera final de 5 segundos antes de fechar para garantir logs
    await page.waitForTimeout(5000);
    
    console.log('[Publish] Fechando navegador automaticamente.');
    await browser.close(); // AGORA FECHA SOZINHO

  } catch (err) {
    console.error('[Publish] ❌ ERRO:', err.message);
    await page.screenshot({ path: 'erro_fatal.png' });
    // Fecha mesmo com erro para não travar processos zumbis
    await browser.close(); 
  }
})();