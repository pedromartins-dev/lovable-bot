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

// Remove aspas que o Windows/Server podem ter enviado
const INVITE_LINK = args[0] ? args[0].replace(/"/g, '') : null;
const EMAIL = args[1] ? args[1].replace(/"/g, '') : null;

if (!INVITE_LINK || !EMAIL) {
    console.error("❌ Erro: Link ou Email não foram recebidos corretamente.");
    process.exit(1);
}

(async () => {
  // Escolhe uma identidade aleatória para essa execução
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  console.log(`[Stealth] Identidade camuflada: ${randomUserAgent.substring(0, 50)}...`);

  // Lança o navegador com argumentos anti-detecção
  const browser = await chromium.launch({ 
      headless: false, 
      slowMo: 100, // Aumentei para 100 para parecer digitação humana real
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
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo'
  });

  const page = await context.newPage();

  // Timeout de segurança
  page.setDefaultTimeout(60000);

  try {
    console.log(`[Signup] Acessando: ${INVITE_LINK}`);
    await page.goto(INVITE_LINK);

    // ============================================================
    // ✅ MANTEVE SUA ADIÇÃO: ESPERA DE 20 SEGUNDOS
    // ============================================================
    console.log('[Info] Aguardando 20 segundos iniciais antes de começar...');
    await page.waitForTimeout(20000); // 20000 ms = 20 segundos
    // ============================================================

    // 1. PREENCHER EMAIL
    console.log('[Signup] 1. Preenchendo email...');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', EMAIL);

    // 2. CLICAR EM "CONTINUAR"
    console.log('[Signup] 2. Buscando botão "Continuar"...');
    
    // Tenta ser específico para evitar Google/Github
    try {
        const btnContinuar = 'button:text-is("Continuar")';
        await page.waitForSelector(btnContinuar, { timeout: 5000 });
        // Pausa aleatória antes de clicar (Humano)
        await page.waitForTimeout(Math.random() * 1000);
        await page.click(btnContinuar);
    } catch (e) {
        // Fallback: botão submit genérico se o texto mudar
        await page.click('button[type="submit"]');
    }

    // 3. SENHA
    console.log('[Signup] 3. Aguardando campo de senha...');
    await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 15000 });
    
    console.log('[Signup] Preenchendo senha...');
    await page.fill('input[type="password"]', EMAIL);

    // Pausa técnica para validação do front-end
    await page.waitForTimeout(2000);

    // 4. CLICAR EM "CRIAR SUA CONTA"
    console.log('[Signup] 4. Finalizando cadastro...');
    
    // Tenta achar o botão final
    try {
        const btnFinal = 'button:text-is("Criar sua conta")';
        await page.waitForSelector(btnFinal, { timeout: 5000 });
        await page.click(btnFinal);
    } catch (e) {
        // Fallback se o texto mudar
        await page.click('button[type="submit"]');
    }

    console.log('[Signup] Aguardando envio...');
    // Aumentei o tempo pois o redirecionamento pós-cadastro pode demorar
    await page.waitForTimeout(8000);
    
    console.log('[Signup] ✅ Cadastro enviado! Fechando.');

  } catch (err) {
    console.error('❌ ERRO:', err.message);
    await page.screenshot({ path: 'erro_signup_fatal.png' });
  } finally {
    // Fecha contexto e browser para limpar cookies/cache para a próxima vez
    await context.close();
    await browser.close();
  }
})();