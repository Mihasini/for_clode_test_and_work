/**
 * Дизайн-токени теми f1monkey.
 *
 * Зразок: «brutalist editorial showroom on warm gray» — монохром, пласкі
 * поверхні, друкарська типографіка, нуль тіней. Глибина йде тільки контрастом
 * поверхонь: canvas → біла картка → чорний інверсний блок.
 */
module.exports = {
    content: [
        './templates/**/*.twig',
        './js/**/*.js',
        './blueprints.yaml',
        './blueprints/**/*.yaml',
        './f1monkey.yaml',
        // Класи можуть приїхати з фронтматера сторінок (body_classes) і конфігів
        '../../pages/**/*.md',
        '../../config/**/*.yaml'
    ],

    darkMode: 'class',

    theme: {
        // Перевизначаємо, а не extend: шкала має бути замкненою, інакше
        // text-4xl і подібні тихо протягнуть у макет розміри поза системою.
        fontSize: {
            xs: ['12px', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
            sm: ['14px', { lineHeight: '1.45', letterSpacing: '-0.02em' }],
            base: ['16px', { lineHeight: '1.55', letterSpacing: '-0.02em' }],
            lg: ['18px', { lineHeight: '1.5', letterSpacing: '-0.02em' }],
            xl: ['20px', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
            '2xl': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
            '3xl': ['40px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
            // Дисплейні. Зразок забороняє лідинг вище 0.95 і не дає ставити
            // дисплейний шрифт дрібніше за 48px.
            'display-sm': ['48px', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
            display: ['80px', { lineHeight: '0.9', letterSpacing: '-0.03em' }],
            'display-xl': ['130px', { lineHeight: '0.9', letterSpacing: '-0.03em' }]
        },

        // Тіней у системі немає взагалі — хай інструмент сам не дає порушити правило
        boxShadow: {
            none: 'none'
        },

        extend: {
            colors: {
                carbon: '#000000',   // текст, інверсні блоки
                paper: '#ffffff',    // картки, пігулка навігації
                canvas: '#e5e5e5',   // фон сторінки — ніколи не чисто білий
                mist: '#f3f3f3',     // друга світла поверхня, код
                graphite: '#2f2f2f', // текст на темному
                slate: '#444444',    // другорядний текст, рамки
                ash: '#c6c6c6',      // роздільники
                smoke: '#979797',    // підписи, метадані
                mint: '#d1ffca',     // акцент: посилання, теги
                voltage: '#fff100'   // мікроакцент, точковий
            },

            fontFamily: {
                display: ['"Oswald Variable"', 'Oswald', 'Impact', 'sans-serif'],
                sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono Variable"', 'JetBrains Mono', 'ui-monospace', 'monospace']
            },

            letterSpacing: {
                display: '-0.03em',
                text: '-0.02em',
                // Дрібний капс без розрідження нечитабельний, тому окремий токен
                label: '0.06em'
            },

            borderRadius: {
                md: '4px',
                lg: '8px',
                card: '24px',
                'card-lg': '32px',
                pill: '48px',
                blob: '64px'
            },

            borderWidth: {
                1.5: '1.5px'
            },

            maxWidth: {
                content: '1200px'
            },

            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        // Без цього prose тягне власну сіру палітру і ламає монохром
                        '--tw-prose-body': theme('colors.carbon'),
                        '--tw-prose-headings': theme('colors.carbon'),
                        '--tw-prose-links': theme('colors.carbon'),
                        '--tw-prose-bold': theme('colors.carbon'),
                        '--tw-prose-counters': theme('colors.slate'),
                        '--tw-prose-bullets': theme('colors.carbon'),
                        '--tw-prose-hr': theme('colors.ash'),
                        '--tw-prose-quotes': theme('colors.carbon'),
                        '--tw-prose-quote-borders': theme('colors.carbon'),
                        '--tw-prose-captions': theme('colors.smoke'),
                        '--tw-prose-code': theme('colors.carbon'),
                        '--tw-prose-pre-code': theme('colors.paper'),
                        '--tw-prose-pre-bg': theme('colors.carbon'),
                        '--tw-prose-th-borders': theme('colors.carbon'),
                        '--tw-prose-td-borders': theme('colors.ash'),

                        maxWidth: 'none',
                        letterSpacing: '-0.02em',

                        // Дисплейний шрифт лише там, де кегль дозволяє (48px+).
                        // h3/h4 — Inter капсом: інакше порушили б правило зразка.
                        'h1, h2': {
                            fontFamily: theme('fontFamily.display').join(', '),
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.03em',
                            lineHeight: '0.9'
                        },
                        h1: { fontSize: '80px' },
                        h2: { fontSize: '48px' },
                        'h3, h4': {
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.02em'
                        },
                        h3: { fontSize: '28px', lineHeight: '1.2' },
                        h4: { fontSize: '20px', lineHeight: '1.4' },

                        a: {
                            fontWeight: '400',
                            textDecorationThickness: '1.5px',
                            textUnderlineOffset: '0.2em'
                        },
                        'a:hover': {
                            backgroundColor: theme('colors.mint'),
                            textDecorationColor: 'transparent'
                        },

                        code: {
                            backgroundColor: theme('colors.mist'),
                            padding: '0.15em 0.4em',
                            borderRadius: theme('borderRadius.md'),
                            fontWeight: '400'
                        },
                        // Плагін дописує зворотні лапки навколо <code> — прибираємо
                        'code::before': { content: '""' },
                        'code::after': { content: '""' },

                        blockquote: {
                            fontStyle: 'normal',
                            borderLeftWidth: '3px',
                            fontSize: '20px'
                        },

                        'thead th': {
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            fontSize: '14px'
                        }
                    }
                }
            })
        }
    },

    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('tailwindcss-debug-screens')
    ]
};
