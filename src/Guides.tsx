import { ArrowUpRight } from "lucide-react";
import { A, PageHead, useApp, stats } from "./core";
import { messages } from "./i18n";
import { TierTable } from "./components";
import { patterns, TOTAL } from "./engine.mjs";
import { Faq, RarestLink, ArticleByline } from "./SeoSections";
import { methodologyContent } from "./seo-content";
const copy: Record<string, string[]> = {
  method1: [
    "We examine every integer from 0 through 1,000,000, written without leading zeros. For each pattern, its probability is its exact match count divided by 1,000,001.",
    "我们分析从 0 到 1,000,000 的全部整数，使用不带前导零的十进制表示。每种模式的概率等于其精确匹配数量除以 1,000,001。",
    "0から1,000,000までの整数を、先頭に0を付けずに分析します。各パターンの確率は、一致数を1,000,001で割った値です。",
    "0부터 1,000,000까지 모든 정수를 앞에 0을 붙이지 않고 분석합니다. 각 패턴의 확률은 정확한 일치 수를 1,000,001로 나눈 값입니다.",
    "Wir untersuchen jede ganze Zahl von 0 bis 1.000.000 ohne führende Nullen. Die Wahrscheinlichkeit eines Musters ist seine exakte Trefferzahl geteilt durch 1.000.001.",
    "Nous analysons tous les entiers de 0 à 1 000 000, sans zéros initiaux. La probabilité d’un motif est son nombre exact d’occurrences divisé par 1 000 001.",
  ],
  method2: [
    "Information is −log₂(probability). Rarer patterns carry more information. Digit sum and distinct-digit count are also scored from their exact distributions; lengths of one to four digits form a separate group.",
    "信息量为 −log₂(概率)，更罕见的模式携带更多信息。数位和、不同数字数也按精确分布计分，一至四位数的长度归入单独分组。",
    "情報量は−log₂(確率)です。珍しいパターンほど情報量が大きくなります。各桁の和と数字の種類数も正確な分布で採点し、1〜4桁の長さは別のグループです。",
    "정보량은 −log₂(확률)입니다. 희귀한 패턴일수록 정보량이 많습니다. 자릿수 합과 서로 다른 숫자 수도 정확한 분포로 계산하며, 한 자리부터 네 자리까지는 별도 그룹입니다.",
    "Der Informationsgehalt ist −log₂(Wahrscheinlichkeit). Seltene Muster tragen mehr Information. Ziffernsumme und Ziffernvielfalt werden nach exakten Verteilungen bewertet; ein- bis vierstellige Längen bilden eine eigene Gruppe.",
    "L’information vaut −log₂(probabilité). Les motifs rares apportent davantage d’information. Somme et diversité des chiffres sont aussi évaluées selon leurs distributions exactes ; les longueurs de un à quatre chiffres forment un groupe distinct.",
  ],
  method3: [
    "Within each family, contributions are sorted and weighted 1, 0.35, 0.15, 0.07 and 0.03. Further overlapping signals add no points. The total information is multiplied by 20 and rounded once to an integer.",
    "同一分组内，贡献从高到低依次乘以 1、0.35、0.15、0.07、0.03，更多重叠特征不再加分。总信息量乘以 20 后统一四舍五入为整数。",
    "同じグループ内では情報量順に1、0.35、0.15、0.07、0.03の重みを付け、それ以降は加点しません。合計を20倍して、最後に整数へ四捨五入します。",
    "같은 그룹의 기여도에 큰 순서대로 1, 0.35, 0.15, 0.07, 0.03을 곱합니다. 그 이후의 중복 특성은 더하지 않습니다. 총 정보량에 20을 곱한 뒤 한 번 반올림합니다.",
    "Innerhalb jeder Familie gelten absteigend die Gewichte 1, 0,35, 0,15, 0,07 und 0,03. Weitere Signale geben keine Punkte. Die Summe wird mit 20 multipliziert und einmal zur ganzen Zahl gerundet.",
    "Dans chaque famille, les contributions décroissantes sont pondérées par 1, 0,35, 0,15, 0,07 et 0,03. Les suivantes n’ajoutent rien. Le total est multiplié par 20, puis arrondi une seule fois.",
  ],
  method4: [
    "Top % is the percentage of all integers whose score is at least this high, including ties. Smaller percentages mean higher rarity rankings. Short numbers often score highly because they are scarce in this fixed range; these highest and lowest boards therefore start at 1,000.",
    "Top % 统计分数大于或等于当前值的整数在全范围中的比例，包含并列，比例越小排名越靠前。短数字在固定范围内较少，常获高分；这里的最高与最低分榜从 1,000 开始。",
    "パーセンタイルは同点以上の数字をすべて数えます。短い数字はこの範囲で少ないため高得点になりやすく、ランキングは1,000以上を対象にします。",
    "백분위는 동점을 포함해 이 점수 이상인 모든 숫자를 셉니다. 짧은 숫자는 범위 안에서 드물어 높은 점수를 얻기 쉬우므로 순위는 1,000부터 시작합니다.",
    "Das Perzentil zählt alle Zahlen mit mindestens diesem Wert, einschließlich Gleichständen. Kurze Zahlen sind im festen Bereich selten und oft hoch bewertet; die Ranglisten beginnen deshalb bei 1.000.",
    "Le percentile inclut tous les nombres au score supérieur ou égal. Les petits nombres sont rares dans ce domaine et souvent bien classés ; les classements commencent donc à 1 000.",
  ],
  engineVersion: [
    "Engine version: {v}. All counts are generated from this project’s independently implemented rules. Individual rounded contributions may not sum to the final score.",
    "引擎版本：{v}。所有计数均由本项目独立实现的规则生成。逐项四舍五入后的贡献之和可能与最终分数略有不同。",
    "エンジンのバージョン：{v}。独自実装のルールで全件を集計。個別に丸めた点数の合計は最終スコアと異なる場合があります。",
    "엔진 버전: {v}. 모든 집계는 독립적으로 구현한 규칙으로 생성됩니다. 개별 반올림 점수의 합은 최종 점수와 다를 수 있습니다.",
    "Engine-Version: {v}. Alle Zählungen entstehen aus eigenständig implementierten Regeln. Gerundete Einzelbeiträge können vom Gesamtergebnis abweichen.",
    "Version du moteur : {v}. Tous les comptages viennent de règles implémentées indépendamment. Les contributions arrondies peuvent ne pas s’additionner au score final.",
  ],
  epText: [
    "This site measures mathematical patterns using information content. Its rarity score is not interchangeable with another game’s Entropy Points (EP). Every exact number still has the same chance on each roll. A previous result does not change the next roll.",
    "本站使用信息量衡量数学模式，稀有度分数不能与其他游戏的熵点（EP）直接互换。每次抽取时，每个具体数字的概率仍相同，上次结果不会改变下次概率。",
    "このサイトは情報量で数学的パターンを評価します。他のゲームのEntropy Points（EP）とは交換できません。各数字の抽選確率は常に同じで、前回の結果は次回に影響しません。",
    "이 사이트는 정보량으로 수학적 패턴을 평가합니다. 희귀도 점수는 다른 게임의 엔트로피 포인트(EP)와 다릅니다. 각 숫자의 확률은 매번 같고 이전 결과는 다음 뽑기에 영향을 주지 않습니다.",
    "Diese Seite misst mathematische Muster durch Informationsgehalt. Der Wert ist nicht mit Entropy Points (EP) anderer Spiele austauschbar. Jede Zahl bleibt bei jedem Wurf gleich wahrscheinlich; frühere Ergebnisse ändern das nicht.",
    "Ce site mesure les motifs mathématiques par leur information. Son score ne se confond pas avec les points d’entropie (EP) d’autres jeux. Chaque nombre reste équiprobable à chaque tirage ; le passé ne change pas le suivant.",
  ],
  aboutText: [
    "RNGDLE.ART is an independent number laboratory and browser game, inspired by the idea of discovering surprising patterns in ordinary numbers. It is not affiliated with rngdle.com or other similarly named games. Everything you calculate runs on your device.",
    "RNGDLE.ART 是独立的数字实验室和浏览器游戏，灵感来自普通数字中令人意外的规律。本站与 rngdle.com 及其他同名游戏无关联。所有分析计算在你的设备上运行。",
    "RNGDLE.ARTは、身近な数字の意外なパターンを楽しむ独立したラボ兼ブラウザーゲームです。rngdle.comや同名のゲームとは関係ありません。分析は端末上で行います。",
    "RNGDLE.ART는 평범한 숫자 속의 놀라운 패턴을 탐구하는 독립적인 연구실이자 브라우저 게임입니다. rngdle.com 및 유사한 이름의 게임과 관련이 없습니다. 분석은 기기에서 실행됩니다.",
    "RNGDLE.ART ist ein unabhängiges Zahlenlabor und Browserspiel für überraschende Muster in gewöhnlichen Zahlen. Es ist nicht mit rngdle.com oder ähnlich benannten Spielen verbunden. Berechnungen laufen auf deinem Gerät.",
    "RNGDLE.ART est un laboratoire et jeu indépendant consacré aux motifs surprenants des nombres. Il n’est affilié ni à rngdle.com ni aux jeux de nom similaire. Les calculs s’effectuent sur votre appareil.",
  ],
  privacyText: [
    "Language, theme, collections and game progress are stored in your browser’s local storage. Clearing site data removes them. We use Google Analytics 4 to understand page usage. Google may collect page visits, device and browser information, and cookie identifiers, and may store analytics cookies. We do not send your saved numbers or game progress to Google Analytics. Page addresses sent for analytics omit query parameters and fragments. Advertising personalization is disabled in Google Analytics. Hosting providers may process standard request logs to deliver the site. Sharing a link includes the selected number and language.",
    "语言、主题、收藏与游戏进度保存在浏览器本地存储中，清除网站数据会删除这些记录。本站使用 Google Analytics 4 了解页面使用情况。Google 可能收集页面访问、设备和浏览器信息以及 Cookie 标识符，并存储分析 Cookie。我们不会向 Google Analytics 发送你收藏的数字或游戏进度。用于分析的页面地址不包含查询参数和片段标识符。Google Analytics 的广告个性化已关闭。托管服务商可能处理提供网站所需的标准请求日志。分享链接包含所选数字和语言。",
    "言語、テーマ、保存した数字、ゲーム進行はブラウザーのローカルストレージに保存され、サイトデータの削除で消去されます。ページの利用状況を把握するため、Google Analytics 4を使用します。Googleはページ閲覧、端末・ブラウザー情報、Cookie識別子を収集し、解析用Cookieを保存する場合があります。保存した数字やゲーム進行はGoogle Analyticsに送信しません。解析用のページURLにはクエリパラメーターとフラグメントを含めません。Google Analyticsの広告パーソナライズは無効です。ホスティング事業者は配信のために標準リクエストログを扱う場合があります。共有リンクには数字と言語が含まれます。",
    "언어, 테마, 저장한 숫자와 게임 진행은 브라우저의 로컬 저장소에 보관되며 사이트 데이터를 삭제하면 사라집니다. 페이지 이용 현황을 파악하기 위해 Google Analytics 4를 사용합니다. Google은 페이지 방문, 기기 및 브라우저 정보, 쿠키 식별자를 수집하고 분석 쿠키를 저장할 수 있습니다. 저장한 숫자나 게임 진행은 Google Analytics로 전송하지 않습니다. 분석용 페이지 주소에는 쿼리 매개변수와 프래그먼트가 포함되지 않습니다. Google Analytics의 광고 개인 최적화는 비활성화되어 있습니다. 호스팅 제공자는 사이트 제공을 위해 표준 요청 로그를 처리할 수 있습니다. 공유 링크에는 숫자와 언어가 포함됩니다.",
    "Sprache, Design, Sammlungen und Spielstände liegen im lokalen Browserspeicher. Das Löschen der Websitedaten entfernt sie. Wir verwenden Google Analytics 4, um die Nutzung der Seiten zu verstehen. Google kann Seitenaufrufe, Geräte- und Browserinformationen sowie Cookie-Kennungen erfassen und Analyse-Cookies speichern. Gespeicherte Zahlen und Spielstände senden wir nicht an Google Analytics. Für die Analyse übermittelte Seitenadressen enthalten keine Abfrageparameter oder Fragmente. Die Anzeigenpersonalisierung in Google Analytics ist deaktiviert. Hostinganbieter können übliche Anfrageprotokolle zur Bereitstellung verarbeiten. Geteilte Links enthalten Zahl und Sprache.",
    "Langue, thème, collections et progression sont conservés dans le stockage local du navigateur et supprimés avec les données du site. Nous utilisons Google Analytics 4 pour comprendre l’utilisation des pages. Google peut recueillir les visites, des informations sur l’appareil et le navigateur ainsi que des identifiants de cookies, et déposer des cookies d’analyse. Nous n’envoyons ni vos nombres enregistrés ni votre progression à Google Analytics. Les adresses de pages transmises pour l’analyse excluent les paramètres de requête et les fragments. La personnalisation publicitaire dans Google Analytics est désactivée. L’hébergeur peut traiter les journaux nécessaires au service. Les liens partagés incluent le nombre et la langue.",
  ],
  termsText: [
    "Use this site to explore and play with numbers. Scores describe patterns within the stated range and do not predict future rolls. Personal progress is stored only in your browser. Please do not interfere with the service or other visitors.",
    "本站用于探索数字与游戏。分数描述给定范围内的模式，不预测未来抽取结果。个人进度仅保存在你的浏览器中。请勿干扰服务或其他访客。",
    "数字の探索とゲームをお楽しみください。スコアは指定範囲のパターンを示し、次の抽選を予測するものではありません。記録はブラウザーのみに保存されます。サービスや他の利用者を妨害しないでください。",
    "숫자를 탐구하고 즐기는 사이트입니다. 점수는 정해진 범위의 패턴을 설명하며 미래의 뽑기를 예측하지 않습니다. 개인 진행은 브라우저에만 저장됩니다. 서비스나 다른 이용자를 방해하지 마세요.",
    "Diese Seite dient dem Entdecken und Spielen mit Zahlen. Werte beschreiben Muster im angegebenen Bereich und sagen keine künftigen Würfe voraus. Persönliche Fortschritte bleiben im Browser. Bitte störe weder den Dienst noch andere Besucher.",
    "Explorez les nombres et jouez avec eux. Les scores décrivent des motifs dans le domaine indiqué, sans prédire les tirages futurs. La progression reste dans votre navigateur. Merci de ne perturber ni le service ni les autres visiteurs.",
  ],
  contactText: [
    "Report a problem or suggest an improvement through the project’s GitHub issues. Include the page, browser and steps needed to reproduce it.",
    "通过项目的 GitHub Issues 报告问题或提出建议，请附上页面、浏览器和复现步骤。",
    "GitHubのIssuesで問題や改善案をお知らせください。ページ、ブラウザー、再現手順を記載してください。",
    "프로젝트 GitHub 이슈로 문제나 개선 의견을 알려 주세요. 페이지, 브라우저, 재현 단계를 포함해 주세요.",
    "Melde Fehler oder Ideen über die GitHub-Issues des Projekts. Nenne Seite, Browser und Schritte zur Wiederholung.",
    "Signalez un problème ou une idée via les issues GitHub du projet. Précisez la page, le navigateur et les étapes de reproduction.",
  ],
  projectIssues: [
    "Open project issues",
    "打开项目问题页",
    "プロジェクトのIssuesを開く",
    "프로젝트 이슈 열기",
    "Projekt-Issues öffnen",
    "Ouvrir les issues du projet",
  ],
  highest: [
    "Highest scores",
    "最高分",
    "最高スコア",
    "최고 점수",
    "Höchste Werte",
    "Scores les plus hauts",
  ],
  lowest: [
    "Lowest scores",
    "最低分",
    "最低スコア",
    "최저 점수",
    "Niedrigste Werte",
    "Scores les plus bas",
  ],
  rank: ["Rank", "排名", "順位", "순위", "Rang", "Rang"],
};
Object.assign(messages, copy);
export const guideRoutes = ["methodology", "badges", "ep", "leaderboard"];
export function Guides() {
  const { t } = useApp();
  return (
    <>
      <PageHead
        eyebrow={t("guides")}
        title={t("guidesTitle")}
        description={t("guidesIntro")}
      />
      <ArticleByline route="guides" />
      <div className="guide-grid">
        {guideRoutes.map((path, i) => (
          <A to={"/" + path} key={path} className="panel guide-card">
            <span className="mono muted">0{i + 1}</span>
            <h2>{t(path)}</h2>
            <p className="muted small">
              {t(
                path === "methodology"
                  ? "exactNote"
                  : path === "ep"
                    ? "intro"
                    : path === "badges"
                      ? "scoreNote"
                      : "exploreIntro",
              )}
            </p>
            <span className="text-link">
              {t("read")}
              <ArrowUpRight size={17} />
            </span>
          </A>
        ))}
      </div>
    </>
  );
}
export function Article({ name }: { name: string }) {
  const { t, fmt, locale } = useApp();
  const content = name === "methodology" ? methodologyContent(locale) : null;
  return (
    <>
      <PageHead
        eyebrow={t("guides")}
        title={content ? content.h1 : t(name)}
        description={content?.summary}
      />
      <article className="article narrow panel seo-sections">
        <ArticleByline route={name} />
        {name === "methodology" ? (
          <>
            <ol className="method-steps">
              {content!.paragraphs.map((paragraph, index) => (
                <li key={index}>
                  <span className="mono">0{index + 1}</span>
                  <p>{paragraph}</p>
                </li>
              ))}
            </ol>
            <p className="small muted">
              {t("engineVersion", { v: stats.version })}
            </p>
            <h2>
              {locale === "zh"
                ? `${patterns.length} 种模式的精确统计`
                : `Exact statistics for all ${patterns.length} patterns`}
            </h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{t("pattern")}</th>
                    <th>{t("frequency")}</th>
                    <th>{t("matches", { n: "" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {patterns.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <A to={"/patterns/" + p.id}>{t("p_" + p.id)}</A>
                      </td>
                      <td>{fmt((stats.counts[p.id] / TOTAL) * 100, 3)}%</td>
                      <td className="mono">{fmt(stats.counts[p.id])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="actions">
              <RarestLink>
                {locale === "zh"
                  ? "全范围稀有数字榜单"
                  : "Full-range rarest-numbers ranking"}{" "}
                →
              </RarestLink>
              <A to="/leaderboard" className="text-link">
                {t("leaderboard")} →
              </A>
            </div>
            <Faq items={content!.faqs} />
          </>
        ) : name === "badges" ? (
          <>
            <p>{t("scoreNote")}</p>
            <TierTable />
          </>
        ) : name === "leaderboard" ? (
          <>
            <p>{t("method4")}</p>
            <p>
              <RarestLink>
                {locale === "zh"
                  ? "查看包含 0 与一位数的完整范围前 100 名"
                  : "View the full-range top 100, including zero and single-digit numbers"}{" "}
                →
              </RarestLink>
            </p>
            <div className="two-col">
              {["highest", "lowest"].map((key, i) => (
                <section key={key}>
                  <h2>{t(key)}</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>{t("rank")}</th>
                        <th>{t("number")}</th>
                        <th>{t("score")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats[i ? "bottom" : "top"]
                        .slice(0, 20)
                        .map(
                          (
                            { n, score }: { n: number; score: number },
                            index: number,
                          ) => (
                            <tr key={n}>
                              <td>{index + 1}</td>
                              <td>
                                <A to={"/?n=" + n}>{fmt(n)}</A>
                              </td>
                              <td className="mono">{score}</td>
                            </tr>
                          ),
                        )}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            <p>{t(name + "Text")}</p>
            {name === "contact" && (
              <a
                className="button"
                href="https://github.com/cuilinhao/rngdle-code/issues"
                target="_blank"
                rel="noreferrer"
              >
                {t("projectIssues")}
                <ArrowUpRight size={16} />
              </a>
            )}
            {name === "ep" && (
              <A to="/methodology" className="text-link">
                {t("methodology")}
                <ArrowUpRight size={16} />
              </A>
            )}
          </>
        )}
      </article>
    </>
  );
}
