/**
 * Переносить шрифти з @fontsource-variable у теку теми і генерує css/_fonts.css.
 *
 * Навіщо копіювати, а не імпортувати CSS із node_modules: postcss-import вбудує
 * правила, але шляхи в url() лишить як є («./files/...»), і в зібраному
 * dist/css/site.css вони вкажуть у нікуди. Тому файли кладемо поруч із темою
 * і переписуємо url() самі.
 *
 * unicode-range не вигадуємо — переносимо дослівно з CSS, який згенерував
 * fontsource. Помилка в одному діапазоні тихо вимкнула б кирилицю.
 *
 * Результат (fonts/*.woff2 і css/_fonts.css) комітимо в git: сайт має
 * працювати одразу після клону, без npm — так само, як dist/.
 *
 * Заразом пишемо flarum/less/_fonts.less: форум бере ті самі файли шрифтів
 * (compose монтує цю теку в його public/), тому єдине, що відрізняється, —
 * шлях в url(). Генеруємо звідси, щоб два сайти не розійшлися підмножинами.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontsDir = join(root, 'fonts');
const outCss = join(root, 'css', '_fonts.css');
// Корінь стенду — чотири рівні вгору: f1monkey → themes → user → grav
const outLess = join(root, '..', '..', '..', '..', 'flarum', 'less', '_fonts.less');

// Кирилиця обов'язкова — сайт український. latin-ext тримаємо заради лапок,
// тире й діакритики в запозиченнях. greek і vietnamese не тягнемо.
const SUBSETS = ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'];

const PACKAGES = [
    '@fontsource-variable/oswald',          // дисплейний
    '@fontsource-variable/inter',           // текстовий
    '@fontsource-variable/jetbrains-mono'   // моноширинний
];

mkdirSync(fontsDir, { recursive: true });

const wanted = new Set();
const cssBlocks = [];
const lessBlocks = [];

for (const pkg of PACKAGES) {
    const pkgDir = join(root, 'node_modules', pkg);
    const filesDir = join(pkgDir, 'files');

    if (!existsSync(filesDir)) {
        throw new Error(`немає ${filesDir} — спершу npm install`);
    }

    const picked = readdirSync(filesDir).filter((name) =>
        SUBSETS.some((subset) => name.endsWith(`-${subset}-wght-normal.woff2`))
    );

    if (picked.length !== SUBSETS.length) {
        throw new Error(
            `${pkg}: очікував ${SUBSETS.length} файлів (${SUBSETS.join(', ')}), знайшов ${picked.length}`
        );
    }

    for (const name of picked) {
        copyFileSync(join(filesDir, name), join(fontsDir, name));
        wanted.add(name);
    }

    // Забираємо готові @font-face і міняємо лише шлях у url()
    const source = readFileSync(join(pkgDir, 'index.css'), 'utf8');
    for (const block of source.match(/@font-face\s*\{[^}]*\}/g) ?? []) {
        const file = block.match(/url\(\.\/files\/([\w.-]+\.woff2)\)/)?.[1];
        if (!file || !wanted.has(file)) {
            continue;
        }
        // Рахуємо від dist/css/site.css, куди лягає збірка, а не від css/site.css:
        // Tailwind CLI url() не переписує.
        cssBlocks.push(block.replace(`./files/${file}`, `../../fonts/${file}`));
        // У форумі та сама тека змонтована в public/fonts, тому шлях абсолютний:
        // збірка Flarum лягає в public/assets, і відносний вказав би не туди.
        lessBlocks.push(block.replace(`./files/${file}`, `/fonts/${file}`));
    }

    console.log(`${pkg}: ${picked.length} woff2`);
}

const header = [
    '/*',
    ' * Згенеровано автоматично: npm run fonts (scripts/copy-fonts.mjs).',
    ' * Руками не правити — зміни затре наступний запуск.',
    ' */',
    ''
].join('\n');

writeFileSync(outCss, header + cssBlocks.join('\n\n') + '\n', 'utf8');

mkdirSync(dirname(outLess), { recursive: true });
writeFileSync(outLess, header + lessBlocks.join('\n\n') + '\n', 'utf8');

console.log(`\nfonts/: ${wanted.size} файлів, css/_fonts.css і flarum/less/_fonts.less: по ${cssBlocks.length} правил @font-face`);
