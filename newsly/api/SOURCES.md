# Newsly API Source Catalog

`126` sources available on [newsapi.org/v2/sources](https://newsapi.org/docs/endpoints/sources). Organised by country, then category. A `✓` marks a source already wired up in Newsly.

## Categories

newsapi.org uses 7 fixed categories (no "finance" or "politics" — they fold into the closest one):

| Category | Maps to your terms |
|---|---|
| `business` | Business · Finance · Markets |
| `entertainment` | Entertainment · Culture |
| `general` | General · Politics · World · Opinion |
| `health` | Health |
| `science` | Science |
| `sports` | Sports |
| `technology` | Technology |

## Freshness caveats

Some sources are still listed by newsapi but no longer get updated (often because the partnership ended). When `top-headlines` is frozen, try `/v2/everything?sources=<id>&sortBy=publishedAt` — sometimes that returns fresh data.

Known issues at last check:

- **`ars-technica`** — frozen Oct 2024 (replaced in Newsly by Wired + TechRadar)
- **`engadget`** — returns 0 articles
- **`hacker-news`** — frozen Oct 2021
- **`recode`** — frozen May 2024
- **`reuters`** — dropped from newsapi entirely (sourceDoesNotExist)
- **`techcrunch`** — frozen May 2024
- **`vice-news`** — frozen on /v2/top-headlines; vice.py uses /v2/everything?sources=vice-news&sortBy=publishedAt as a workaround

## Adding a new source

1. Pick a source ID from below.
2. Copy an existing folder under `newsly/api/` (e.g. `bloomberg/`) and rename it.
3. In the new `.py`, change `sources` to your new ID and the output filename.
4. In the new `weather.js`, change the JSON URL.
5. In the new `index.html`, change the title, `brand-source` label, and which `<a>` is `active`.
6. Add the source to the `source-strip` of every other source page (alphabetical insert).
7. Add a tile in `newsly/index.html`.
8. Run the new `.py` once locally to populate its JSON.

## Sources by country

### Argentina (`ar`) — 4 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `google-news-ar` | Google News (Argentina) | `es` | Completa cobertura actualizada de noticias agregadas a partir de fuentes de todo el mundo por Goo… |
|  | `infobae` | Infobae | `es` | Noticias de Argentina y del mundo en tiempo real. Información, videos y fotos sobre los hechos má… |
|  | `la-gaceta` | La Gaceta | `es` | El diario de Tucumán, noticias 24 horas online - San Miguel de Tucumán - Argentina - Ultimo momen… |
|  | `la-nacion` | La Nacion | `es` | Información confiable en Internet. Noticias de Argentina y del mundo - ¡Informate ya! |


### Australia (`au`) — 4 sources

#### Business / Finance

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `australian-financial-review` | Australian Financial Review | `en` | The Australian Financial Review reports the latest news from business, finance, investment and po… |

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `abc-news-au` | ABC News (AU) | `en` | Australia's most trusted source of local, national and world news. Comprehensive, independent, in… |
|  | `google-news-au` | Google News (Australia) | `en` | Comprehensive, up-to-date Australia news coverage, aggregated from sources all over the world by … |
|  | `news-com-au` | News.com.au | `en` | We say what people are thinking and cover the issues that get people talking balancing Australian… |


### Brazil (`br`) — 4 sources

#### Business / Finance

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `info-money` | InfoMoney | `pt` | No InfoMoney você encontra tudo o que precisa sobre dinheiro. Ações, investimentos, bolsas de val… |

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `blasting-news-br` | Blasting News (BR) | `pt` | Descubra a seção brasileira da Blasting News, a primeira revista feita pelo  público, com notícia… |
|  | `globo` | Globo | `pt` | Só na globo.com você encontra tudo sobre o conteúdo e marcas do Grupo Globo. O melhor acervo de v… |
|  | `google-news-br` | Google News (Brasil) | `pt` | Cobertura jornalística abrangente e atualizada, agregada de fontes do mundo inteiro pelo Google N… |


### Canada (`ca`) — 4 sources

#### Business / Finance

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `financial-post` | Financial Post | `en` | Find the latest happenings in the Canadian Financial Sector and stay up to date with changing tre… |

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `cbc-news` | CBC News | `en` | CBC News is the division of the Canadian Broadcasting Corporation responsible for the news gather… |
|  | `google-news-ca` | Google News (Canada) | `en` | Comprehensive, up-to-date Canada news coverage, aggregated from sources all over the world by Goo… |
|  | `the-globe-and-mail` | The Globe And Mail | `en` | The Globe and Mail offers the most authoritative news in Canada, featuring national and internati… |


### China (`zh`) — 2 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `xinhua-net` | Xinhua Net | `zh` | 中国主要重点新闻网站,依托新华社遍布全球的采编网络,记者遍布世界100多个国家和地区,地方频道分布全国31个省市自治区,每天24小时同时使用6种语言滚动发稿,权威、准确、及时播发国内外重要新闻和… |

#### Technology

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `techcrunch-cn` | TechCrunch (CN) | `zh` | TechCrunch is a leading technology media property, dedicated to obsessively profiling startups, r… |


### France (`fr`) — 5 sources

#### Business / Finance

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `les-echos` | Les Echos | `fr` | Toute l'actualité économique, financière et boursière française et internationale sur Les Echos.fr |

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `google-news-fr` | Google News (France) | `fr` | Informations complètes et à jour, compilées par Google Actualités à partir de sources d&#39;actua… |
|  | `le-monde` | Le Monde | `fr` | Les articles du journal et toute l'actualit&eacute; en continu : International, France, Soci&eacu… |
|  | `liberation` | Libération | `fr` | Toute l'actualité en direct - photos et vidéos avec Libération |

#### Sports

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `lequipe` | L'equipe | `fr` | Le sport en direct sur L'EQUIPE.fr. Les informations, résultats et classements de tous les sports… |


### Germany (`de`) — 10 sources

#### Business / Finance

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `die-zeit` | Die Zeit | `de` | Aktuelle Nachrichten, Kommentare, Analysen und Hintergrundberichte aus Politik, Wirtschaft, Gesel… |
|  | `handelsblatt` | Handelsblatt | `de` | Auf Handelsblatt lesen sie Nachrichten über Unternehmen, Finanzen, Politik und Technik. Verwalten… |
|  | `wirtschafts-woche` | Wirtschafts Woche | `de` | Das Online-Portal des führenden Wirtschaftsmagazins in Deutschland. Das Entscheidende zu Unterneh… |

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `bild` | Bild | `de` | Die Seite 1 für aktuelle Nachrichten und Themen, Bilder und Videos aus den Bereichen News, Wirtsc… |
|  | `der-tagesspiegel` | Der Tagesspiegel | `de` | Nachrichten, News und neueste Meldungen aus dem Inland und dem Ausland - aktuell präsentiert von … |
|  | `focus` | Focus | `de` | Minutenaktuelle Nachrichten und Service-Informationen von Deutschlands modernem Nachrichtenmagazin. |
|  | `spiegel-online` | Spiegel Online | `de` | Deutschlands führende Nachrichtenseite. Alles Wichtige aus Politik, Wirtschaft, Sport, Kultur, Wi… |

#### Technology

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `gruenderszene` | Gruenderszene | `de` | Online-Magazin für Startups und die digitale Wirtschaft. News und Hintergründe zu Investment, VC … |
|  | `t3n` | T3n | `de` | Das Online-Magazin bietet Artikel zu den Themen E-Business, Social Media, Startups und Webdesign. |
|  | `wired-de` | Wired.de | `de` | Wired reports on how emerging technologies affect culture, the economy and politics. |


### Iceland (`is`) — 3 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `google-news-is` | Google News (Israel) | `he` | כיסוי מקיף ועדכני של חדשות שהצטברו ממקורות בכל העולם על ידי &#39;חדשות Google&#39;. |
|  | `the-jerusalem-post` | The Jerusalem Post | `en` | The Jerusalem Post is the leading online newspaper for English speaking Jewry since 1932, bringin… |
|  | `ynet` | Ynet | `he` | ynet דף הבית: אתר החדשות המוביל בישראל מבית ידיעות אחרונות. סיקור מלא של חדשות מישראל והעולם, ספו… |


### India (`in`) — 3 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `google-news-in` | Google News (India) | `en` | Comprehensive, up-to-date India news coverage, aggregated from sources all over the world by Goog… |
|  | `the-hindu` | The Hindu | `en` | The Hindu. latest news, analysis, comment, in-depth coverage of politics, business, sport, enviro… |
|  | `the-times-of-india` | The Times of India | `en` | Times of India brings the Latest News and Top Breaking headlines on Politics and Current Affairs … |


### Ireland (`ie`) — 2 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `rte` | RTE | `en` | Get all of the latest breaking local and international news stories as they happen, with up to th… |
|  | `the-irish-times` | The Irish Times | `en` | The Irish Times online. Latest news including sport, analysis, business, weather and more from th… |


### Italy (`it`) — 5 sources

#### Business / Finance

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `il-sole-24-ore` | Il Sole 24 Ore | `it` | Notizie di economia, cronaca italiana ed estera, quotazioni borsa in tempo reale e di finanza, no… |

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `ansa` | ANSA.it | `it` | Agenzia ANSA: ultime notizie, foto, video e approfondimenti su: cronaca, politica, economia, regi… |
|  | `google-news-it` | Google News (Italy) | `it` | Copertura giornalistica completa e aggiornata ottenuta combinando fonti di notizie in tutto il mo… |
|  | `la-repubblica` | La Repubblica | `it` | Breaking News, Latest News and Current News from FOXNews.com. Breaking news and video. Latest Cur… |

#### Sports

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `football-italia` | Football Italia | `en` | Italian football news, analysis, fixtures and results for the latest from Serie A, Serie B and th… |


### Netherlands (`nl`) — 1 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `rtl-nieuws` | RTL Nieuws | `nl` | Volg het nieuws terwijl het gebeurt. RTL Nieuws informeert haar lezers op een onafhankelijke, boe… |


### Norway (`no`) — 2 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `aftenposten` | Aftenposten | `no` | Norges ledende nettavis med alltid oppdaterte nyheter innenfor innenriks, utenriks, sport og kultur. |
|  | `nrk` | NRK | `no` | NRK er Norges største tilbud på nett: nyheter fra Norge og verden, lokalnyheter, radio- og tv-pro… |


### Pakistan (`pk`) — 1 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `ary-news` | Ary News | `ud` | ARY News is a Pakistani news channel committed to bring you up-to-the minute Pakistan news and fe… |


### Russia (`ru`) — 4 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `google-news-ru` | Google News (Russia) | `ru` | Исчерпывающая и актуальная информация, собранная службой &quot;Новости Google&quot; со всего света. |
|  | `lenta` | Lenta | `ru` | Новости, статьи, фотографии, видео. Семь дней в неделю, 24 часа в сутки. |
|  | `rbc` | RBC | `ru` | Главные новости политики, экономики и бизнеса, комментарии аналитиков, финансовые данные с россий… |
|  | `rt` | RT | `ru` | Актуальная картина дня на RT: круглосуточное ежедневное обновление новостей политики, бизнеса, фи… |


### Saudi Arabia (`sa`) — 3 sources

#### Business / Finance

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `argaam` | Argaam | `ar` | ارقام موقع متخصص في متابعة سوق الأسهم السعودي تداول - تاسي - مع تغطيه معمقة لشركات واسعار ومنتجات… |

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `google-news-sa` | Google News (Saudi Arabia) | `ar` | تغطية شاملة ومتجددة للأخبار، تم جمعها من مصادر أخبار من جميع أنحاء العالم بواسطة أخبار Google. |
|  | `sabq` | SABQ | `ar` | صحيفة الكترونية سعودية هدفها السبق في نقل الحدث بمهنية ومصداقية خدمة للوطن والمواطن. |


### South Africa (`za`) — 1 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `news24` | News24 | `en` | South Africa's premier news source, provides breaking news on national, world, Africa, sport, ent… |


### Spain (`es`) — 2 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `el-mundo` | El Mundo | `es` | Noticias, actualidad, álbumes, debates, sociedad, servicios, entretenimiento y última hora en Esp… |

#### Sports

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `marca` | Marca | `es` | La mejor información deportiva en castellano actualizada minuto a minuto en noticias, vídeos, fot… |


### Sweden (`se`) — 2 sources

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `goteborgs-posten` | Göteborgs-Posten | `sv` | Göteborgs-Posten, abbreviated GP, is a major Swedish language daily newspaper published in Gothen… |
|  | `svenska-dagbladet` | Svenska Dagbladet | `sv` | Sveriges ledande mediesajt - SvD.se. Svenska Dagbladets nyhetssajt låter läsarna ta plats och för… |


### United Kingdom (`gb`) — 9 sources

#### Entertainment

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `mtv-news-uk` | MTV News (UK) | `en` | All the latest celebrity news, gossip, exclusive interviews and pictures from the world of music … |
|  | `the-lad-bible` | The Lad Bible | `en` | The LAD Bible is one of the largest community for guys aged 16-30 in the world. Send us your funn… |

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
| ✓ | `bbc-news` | BBC News | `en` | Use BBC News for up-to-the-minute news, breaking news, video, audio and feature stories. BBC News… |
|  | `google-news-uk` | Google News (UK) | `en` | Comprehensive, up-to-date UK news coverage, aggregated from sources all over the world by Google … |
|  | `independent` | Independent | `en` | National morning quality (tabloid) includes free online access to news and supplements. Insight b… |

#### Sports

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
| ✓ | `bbc-sport` | BBC Sport | `en` | The home of BBC Sport online. Includes live sports coverage, breaking news, results, video, audio… |
|  | `four-four-two` | FourFourTwo | `en` | The latest football news, in-depth features, tactical and statistical analysis from FourFourTwo, … |
|  | `talksport` | TalkSport | `en` | Tune in to the world's biggest sports radio station - Live Premier League football coverage, brea… |
|  | `the-sport-bible` | The Sport Bible | `en` | TheSPORTbible is one of the largest communities for sports fans across the world. Send us your sp… |


### United States (`us`) — 55 sources

#### Business / Finance

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
| ✓ | `bloomberg` | Bloomberg | `en` | Bloomberg delivers business and markets news, data, analysis, and video to the world, featuring s… |
|  | `business-insider` | Business Insider | `en` | Business Insider is a fast-growing business site with deep financial, media, tech, and other indu… |
|  | `fortune` | Fortune | `en` | Fortune 500 Daily and Breaking Business News |
| ✓ | `the-wall-street-journal` | The Wall Street Journal | `en` | WSJ online coverage of breaking news and current headlines from the US and around the world. Top … |

#### Entertainment

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `buzzfeed` | Buzzfeed | `en` | BuzzFeed is a cross-platform, global network for news and entertainment that generates seven bill… |
|  | `entertainment-weekly` | Entertainment Weekly | `en` | Online version of the print magazine includes entertainment news, interviews, reviews of music, f… |
|  | `ign` | IGN | `en` | IGN is your site for Xbox One, PS4, PC, Wii-U, Xbox 360, PS3, Wii, 3DS, PS Vita and iPhone games … |
|  | `mashable` | Mashable | `en` | Mashable is a global, multi-platform media and entertainment company. |
|  | `mtv-news` | MTV News | `en` | The ultimate news source for music, celebrity, entertainment, movies, and current events on the w… |
|  | `polygon` | Polygon | `en` | Polygon is a gaming website in partnership with Vox Media. Our culture focused site covers games,… |

#### General / Politics / World

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `abc-news` | ABC News | `en` | Your trusted source for breaking news, analysis, exclusive interviews, headlines, and videos at A… |
| ✓ | `al-jazeera-english` | Al Jazeera English | `en` | News, analysis from the Middle East and worldwide, multimedia and interactives, opinions, documen… |
| ✓ | `associated-press` | Associated Press | `en` | The AP delivers in-depth coverage on the international, politics, lifestyle, business, and entert… |
|  | `axios` | Axios | `en` | Axios are a new media company delivering vital, trustworthy news and analysis in the most efficie… |
|  | `breitbart-news` | Breitbart News | `en` | Syndicated news and opinion website providing continuously updated headlines to top news and anal… |
|  | `cbs-news` | CBS News | `en` | CBS News: dedicated to providing the best in journalism under standards it pioneered at the dawn … |
| ✓ | `cnn` | CNN | `en` | View the latest news and breaking news today for U.S., world, weather, entertainment, politics an… |
|  | `cnn-es` | CNN Spanish | `es` | Lee las últimas noticias e información sobre Latinoamérica, Estados Unidos, mundo, entretenimient… |
|  | `fox-news` | Fox News | `en` | Breaking News, Latest News and Current News from FOXNews.com. Breaking news and video. Latest Cur… |
|  | `google-news` | Google News | `en` | Comprehensive, up-to-date news coverage, aggregated from sources all over the world by Google News. |
|  | `msnbc` | MS Now | `en` | Breaking news and in-depth analysis of the headlines, as well as commentary and informed perspect… |
|  | `national-review` | National Review | `en` | National Review: Conservative News, Opinion, Politics, Policy, & Current Events. |
|  | `nbc-news` | NBC News | `en` | Breaking news, videos, and the latest top stories in world news, business, politics, health and p… |
|  | `new-york-magazine` | New York Magazine | `en` | NYMAG and New York magazine cover the new, the undiscovered, the next in politics, culture, food,… |
|  | `newsweek` | Newsweek | `en` | Newsweek provides in-depth analysis, news and opinion about international issues, technology, bus… |
|  | `politico` | Politico | `en` | Political news about Congress, the White House, campaigns, lobbyists and issues. |
|  | `reddit-r-all` | Reddit /r/all | `en` | Reddit is an entertainment, social news networking service, and news website. Reddit's registered… |
|  | `the-american-conservative` | The American Conservative | `en` | Realism and reform. A new voice for a new generation of conservatives. |
|  | `the-hill` | The Hill | `en` | The Hill is a top US political website, read by the White House and more lawmakers than any other… |
| ✓ | `the-huffington-post` | The Huffington Post | `en` | The Huffington Post is a politically liberal American online news aggregator and blog that has bo… |
| ✓ | `the-washington-post` | The Washington Post | `en` | Breaking news and analysis on politics, business, world national news, entertainment more. In-dep… |
|  | `the-washington-times` | The Washington Times | `en` | The Washington Times delivers breaking news and commentary on the issues that affect the future o… |
|  | `time` | Time | `en` | Breaking news and analysis from TIME.com. Politics, world news, photos, video, tech reviews, heal… |
|  | `usa-today` | USA Today | `en` | Get the latest national, international, and political news at USATODAY.com. |
| ✓ | `vice-news` | Vice News | `en` | Vice News is Vice Media, Inc.'s current affairs channel, producing daily documentary essays and v… |

#### Health

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `medical-news-today` | Medical News Today | `en` | Medical news and health news headlines posted throughout the day, every day. |

#### Science

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `national-geographic` | National Geographic | `en` | Reporting our world daily: original nature and science news from National Geographic. |
|  | `new-scientist` | New Scientist | `en` | Breaking science and technology news from around the world. Exclusive stories and expert analysis… |
|  | `next-big-future` | Next Big Future | `en` | Coverage of science and technology that have the potential for disruption, and analysis of plans,… |

#### Sports

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `bleacher-report` | Bleacher Report | `en` | Sports journalists and bloggers covering NFL, MLB, NBA, NHL, MMA, college football and basketball… |
|  | `espn` | ESPN | `en` | ESPN has up-to-the-minute sports news coverage, scores, highlights and commentary for NFL, MLB, N… |
|  | `espn-cric-info` | ESPN Cric Info | `en` | ESPN Cricinfo provides the most comprehensive cricket coverage available including live ball-by-b… |
|  | `fox-sports` | Fox Sports | `en` | Find live scores, player and team news, videos, rumors, stats, standings, schedules and fantasy g… |
|  | `nfl-news` | NFL News | `en` | The official source for NFL news, schedules, stats, scores and more. |
|  | `nhl-news` | NHL News | `en` | The most up-to-date breaking hockey news from the official source including interviews, rumors, s… |

#### Technology

| ✓ | ID | Name | Language | Description |
|---|---|---|---|---|
|  | `ars-technica` | Ars Technica | `en` | The PC enthusiast's resource. Power users and the tools they love, without computing religion. |
|  | `crypto-coins-news` | Crypto Coins News | `en` | Providing breaking cryptocurrency news - focusing on Bitcoin, Ethereum, ICOs, blockchain technolo… |
|  | `engadget` | Engadget | `en` | Engadget is a web magazine with obsessive daily coverage of everything new in gadgets and consume… |
|  | `hacker-news` | Hacker News | `en` | Hacker News is a social news website focusing on computer science and entrepreneurship. It is run… |
|  | `recode` | Recode | `en` | Get the latest independent tech news, reviews and analysis from Recode with the most informed and… |
|  | `techcrunch` | TechCrunch | `en` | TechCrunch is a leading technology media property, dedicated to obsessively profiling startups, r… |
| ✓ | `techradar` | TechRadar | `en` | The latest technology news and reviews, covering computing, home entertainment systems, gadgets a… |
|  | `the-next-web` | The Next Web | `en` | The Next Web is one of the world’s largest online publications that delivers an international per… |
|  | `the-verge` | The Verge | `en` | The Verge covers the intersection of technology, science, art, and culture. |
| ✓ | `wired` | Wired | `en` | Wired is a monthly American magazine, published in print and online editions, that focuses on how… |


---

_Generated from `/v2/sources`. Re-run the fetch script to refresh._