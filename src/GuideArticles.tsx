import { A, PageHead, stats } from "./core";
import { ArticleByline, Faq } from "./SeoSections";
import { TOTAL, patterns } from "./engine.mjs";
import { patternName } from "./seo-content";
import {
  enNumber,
  featuredPatternIds,
  guideArticles,
  guideContent,
  howToPlayGuide,
  patternCount,
  patternShare,
  rarestGuide,
  rarityGuide,
  type GuideContent,
} from "./guide-content";

export function GuideSteps({ content }: { content: GuideContent }) {
  return (
    <section id="step-by-step">
      <h2>{content.stepsTitle}</h2>
      <ol>
        {content.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <p>
        <A to="/">Analyze your number</A> · <A to="/compare">Compare two numbers</A>
      </p>
    </section>
  );
}

export function RelatedGuides({ current }: { current: string }) {
  return (
    <section className="related-guides" aria-label="Related guides">
      <h2>Keep exploring</h2>
      <ul>
        {guideArticles.filter((item) => item.route !== current).map((item) => (
          <li key={item.route}><A to={"/" + item.route}>{item.h1}</A></li>
        ))}
        <li><A to="/methodology">Full scoring methodology and exact statistics</A></li>
        <li><A to="/guides">All guides</A></li>
      </ul>
    </section>
  );
}

export function PatternOddsTable({ ranked = false }: { ranked?: boolean }) {
  return (
    <div className="table-scroll">
      <table data-testid="guide-pattern-odds">
        <caption>Selected patterns in 0–1,000,000 ({enNumber(TOTAL)} integers)</caption>
        <thead>
          <tr>
            {ranked && <th scope="col">Position in this selection</th>}
            <th scope="col">Pattern</th>
            <th scope="col">Numbers that match</th>
            <th scope="col">Share of the range</th>
            {ranked && <th scope="col">Uniform-draw odds (approx.)</th>}
          </tr>
        </thead>
        <tbody>
          {featuredPatternIds.map((id, index) => (
            <tr key={id}>
              {ranked && <td>{index + 1}</td>}
              <th scope="row"><A to={"/patterns/" + id}>{patternName("en", id)}</A></th>
              <td>{enNumber(patternCount(id))}</td>
              <td>{patternShare(id)}</td>
              {ranked && <td>1 in {enNumber(TOTAL / patternCount(id))}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RarityBody() {
  return (
    <>
      <section>
        <h2>How the rarity score is built</h2>
        <p>
          Every number is checked against {patterns.length} independently implemented patterns.
          A match is a hit, and a feature found in fewer numbers carries more information.
          Our counts come from evaluating every integer from 0 through 1,000,000,
          without leading zeros. The denominator is {enNumber(TOTAL)}, including both endpoints.
        </p>
        <PatternOddsTable />
        <p>
          A prime hit alone covers about 7.8% of the range, so it does not establish
          exceptional rarity. Multiple hits can add information, but they can also
          overlap: every repdigit in our definition is already a palindrome.
          Multiplying their separate probabilities would overstate how unusual that combination is.
        </p>
        <p>
          RNGDLE.ART converts exact feature frequencies into −log₂(probability),
          discounts overlaps within each scoring family, and includes digit sum,
          distinct-digit count and short-length information. The weighted total is
          multiplied by 20 and rounded once. The <A to="/methodology">methodology</A>
          {" "}explains the formula and all {patterns.length} pattern counts.
        </p>
        <p>
          Official RNGdle uses badges and EP (entropy points). Its{" "}
          <a href="https://www.rngdle.com/about">rules page</a> explains rarity,
          but our independent score does not reproduce official EP.
        </p>
      </section>
      <section>
        <h2>Why pattern-based rarity is useful</h2>
        <ol>
          <li><strong>Reproducible.</strong> Anyone can re-check a number under the same engine and get the same score.</li>
          <li><strong>Consistent comparisons.</strong> All numbers use the same reference range and rules.</li>
          <li><strong>Free to inspect.</strong> You can analyze and compare numbers on this site without an account or payment.</li>
        </ol>
      </section>
      <section>
        <h2>Where the score breaks down</h2>
        <ul>
          <li><strong>Common patterns can look impressive.</strong> A mathematical name or a long badge list does not automatically mean a high score.</li>
          <li><strong>Unimplemented patterns are invisible.</strong> A feature outside the rules has no direct contribution, however interesting it looks.</li>
          <li><strong>The range matters.</strong> These exact shares apply only to 0–1,000,000. This analyzer does not score out-of-range inputs.</li>
          <li><strong>A score is not a forecast.</strong> Earlier rolls do not make a particular next result more likely in an independent uniform draw.</li>
        </ul>
      </section>
      <section>
        <h2>Who should (and shouldn't) use a rarity score</h2>
        <p><strong>Should:</strong> daily-game players checking a roll before sharing, people comparing two numbers, and teachers or writers looking for a concrete way to explain a mathematical property.</p>
        <p><strong>Shouldn't:</strong> anyone treating the score as a lottery predictor, betting signal or official EP calculator. It describes number features under our stated rules.</p>
      </section>
      <GuideSteps content={rarityGuide} />
    </>
  );
}

function HowToPlayBody() {
  return (
    <>
      <section>
        <h2>How a roll actually works</h2>
        <p>
          The <a href="https://www.rngdle.com/about">official rules</a> describe
          one daily random draw from 0 to 1,000,000. Properties earn badges and EP;
          the roll's total EP determines its rarity relative to possible rolls.
          Treat the number you receive as your result, not a shared puzzle solution.
        </p>
        <p>
          Use <a href="https://www.rngdle.com/">rngdle.com</a> for the official
          roll, account and leaderboard. Use this site's <A to="/">analyzer</A>
          {" "}to investigate the number afterward. Our local score is not interchangeable
          with official EP, and our pattern definitions can differ from official badges.
        </p>
      </section>
      <section>
        <h2>Why it's worth a short daily visit</h2>
        <ul>
          <li><strong>A quick mathematical surprise.</strong> An ordinary-looking number may hide symmetry, a sequence or an arithmetic property.</li>
          <li><strong>Patterns you can verify.</strong> Read a rule, check the number and explain the result to a friend.</li>
          <li><strong>A small daily habit.</strong> The appeal is discovering the result rather than practicing a strategy to control a random roll.</li>
          <li><strong>Independent analysis.</strong> RNGDLE.ART supplies exact counts for its own reference space, so you can explore why a property is unusual.</li>
        </ul>
      </section>
      <section>
        <h2>The trade-offs</h2>
        <ul>
          <li><strong>You cannot optimize the draw.</strong> Understanding patterns helps you interpret a result, not choose a luckier official number.</li>
          <li><strong>One result is a tiny sample.</strong> A disappointing day says little about the next independent roll.</li>
          <li><strong>Accounts and local storage differ.</strong> Follow the official site's account prompts for saved rolls. This site's game progress is stored in your browser.</li>
          <li><strong>Tools have separate rules.</strong> An independent calculator cannot change your official result, badges or EP.</li>
        </ul>
      </section>
      <section>
        <h2>Who should (and shouldn't) play</h2>
        <p><strong>Should:</strong> daily-puzzle regulars, number-trivia fans and teachers who want a short prompt for discussing mathematical patterns.</p>
        <p><strong>Shouldn't:</strong> anyone expecting a strategy that guarantees a better random draw. If you prefer making decisions, try RNGDLE.ART's separate <A to="/daily">daily challenges</A>.</p>
      </section>
      <GuideSteps content={howToPlayGuide} />
      <section>
        <h2>Badge and pattern starter set</h2>
        <p>
          These definitions and counts describe our analyzer, not an exhaustive
          official badge catalog. Single-digit integers are 0 through 9: ten values.
          Our repdigit rule requires at least two digits, all identical; our palindrome rule
          requires at least two digits. Fibonacci numbers include 0 and count 1 once.
        </p>
        <div className="table-scroll">
          <table>
            <thead><tr><th scope="col">Pattern</th><th scope="col">What it means here</th><th scope="col">Exact count</th></tr></thead>
            <tbody>
              <tr><th scope="row">Single digit</th><td>One digit, including zero; covered by length information</td><td>10</td></tr>
              {[
                ["repdigit", "Two or more digits, all identical"],
                ["palindrome", "At least two digits, reading the same backward"],
                ["fibonacci", "A distinct value in the Fibonacci sequence"],
                ["prime", "An integer greater than 1 with exactly two positive divisors"],
                ["harshad", "A positive integer divisible by its digit sum"],
              ].map(([id, meaning]) => (
                <tr key={id}><th scope="row"><A to={"/patterns/" + id}>{patternName("en", id)}</A></th><td>{meaning}</td><td>{enNumber(patternCount(id))}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>Where to find the daily answer</h2>
        <p>
          RNGDLE.ART has its own seeded <A to="/daily">Daily</A> game, with
          number draft, comparison and hunt modes. Its active mode rotates daily,
          and challenges reset at 00:00 UTC. Players of this site can consult the
          {" "}<A to="/daily/answer">Daily Answers archive</A> for the published
          solutions and exact scores. Those pages are not answers for rngdle.com.
        </p>
      </section>
    </>
  );
}

export function RarestGuideSections() {
  return (
    <>
      <section id="pattern-odds">
        <h2>What “rarest” means here</h2>
        <p>
          Rarer features are shared by fewer numbers in the reference space.
          Here are five familiar patterns, ordered by their exact match counts.
          This selection is not the complete ranking of all {patterns.length} patterns.
        </p>
        <PatternOddsTable ranked />
        <p>
          <A to="/patterns/factorial">Factorial numbers</A> are even less frequent:
          {" "}{enNumber(patternCount("factorial"))} distinct integers match.
          <A to="/patterns/binaryOnes"> All-one binary numbers</A>,
          <A to="/patterns/power2"> powers of two</A> and some digit sequences
          are also less frequent than Fibonacci numbers under our definitions.
          The <A to="/methodology">complete statistics</A> give the full picture.
        </p>
        <p>
          Prime and Harshad hits are relatively common compared with the first
          rows, but neither decides a whole number's rank on its own. Features
          overlap, so two rare hits are not necessarily two independent surprises.
        </p>
      </section>
      <section>
        <h2>The “worst” numbers</h2>
        <p>
          A low score means the combined features are relatively ordinary under
          the current engine. It does not mean an ugly number or necessarily zero
          badges. Even a number without a listed pattern can receive points from
          its digit sum, digit diversity or short length.
        </p>
        <p>
          For example, <A to={"/?n=" + stats.bottom[0].n}>{enNumber(stats.bottom[0].n)}</A>
          {" "}scores {enNumber(stats.bottom[0].score)} on the existing lowest-score
          board, whose candidates start at 1,000. Visit the <A to="/leaderboard">leaderboard</A>
          {" "}for those entries and their stated range. This is not an official
          RNGdle “worst roll” record.
        </p>
      </section>
      <section>
        <h2>Why the answer can change</h2>
        <ul>
          <li><strong>Range assumptions change the odds.</strong> Widen or narrow the pool and each feature's share changes.</li>
          <li><strong>Rules define the result.</strong> Adding a pattern or changing weights can change the ranking; these counts belong to the displayed engine version.</li>
          <li><strong>Rarity belongs to the result.</strong> A rare roll does not make a later independent roll rarer.</li>
        </ul>
      </section>
      <section>
        <h2>Who this list is for</h2>
        <p>
          Players deciding how to describe a roll, readers comparing number
          patterns, and anyone who wants an answer with a stated range and scoring
          rule. For official records, consult the official game; for our complete
          score ranking, use the top 100 below.
        </p>
      </section>
      <GuideSteps content={rarestGuide} />
    </>
  );
}

export function GuideArticle({ route }: { route: string }) {
  const content = guideContent(route)!;
  return (
    <>
      <nav className="guide-breadcrumb" aria-label="Breadcrumb">
        <A to="/">Home</A><span aria-hidden="true"> / </span>
        <A to="/guides">Guides</A>
      </nav>
      <PageHead eyebrow="Guides" title={content.h1} description={content.summary} />
      <article className="article narrow panel seo-sections guide-article">
        <ArticleByline route={route} />
        {route === rarityGuide.route ? <RarityBody /> : <HowToPlayBody />}
        <Faq items={content.faqs} />
        <RelatedGuides current={route} />
      </article>
    </>
  );
}
