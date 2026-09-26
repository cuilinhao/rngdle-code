import { htmlLangs, locales, translate, type Locale } from "./i18n";

export type NumberRow = {
  n: number;
  score: number;
  percent: number;
  patterns: string[];
};
export type DailySnapshot = {
  date: string;
  version: string;
  sourceHash: string;
  datePublished: string;
  dateModified: string;
  officialMode: "draft" | "hunt" | "quiz";
  topNumber: NumberRow;
  patternOfDay: string | null;
  specimen: NumberRow;
  modes: {
    draft: { numbers: NumberRow[]; winner: NumberRow; winnerIndices: number[] };
    hunt: { numbers: NumberRow[]; winner: NumberRow; winnerIndices: number[] };
    quiz: {
      rounds: {
        round: number;
        options: NumberRow[];
        winner: NumberRow | null;
        winnerIndex: number | null;
      }[];
    };
  };
};

const text: Record<string, string[]> = {
  answer: [
    "RNGDLE Daily Answer",
    "RNGDLE 每日答案",
    "RNGDLE デイリー解答",
    "RNGDLE 일일 정답",
    "RNGDLE Tageslösung",
    "Solution quotidienne RNGDLE",
  ],
  titleSuffix: [
    "Numbers & Solutions",
    "数字与解答",
    "数字と解答",
    "숫자와 정답",
    "Zahlen und Lösungen",
    "Nombres et solutions",
  ],
  draftSummary: [
    "The seeded RNGDLE.ART number draft answer for {date} is {n}, with a rarity score of {score} — the top {percent}% of all integers from 0 to 1,000,000, ties included.",
    "{date} 的 RNGDLE.ART 固定种子五选一答案是 {n}，稀有度得分为 {score}，属于从 0 到 1,000,000 全部整数的前 {percent}%（包含并列）。",
    "{date}のRNGDLE.ART固定シード5択の解答は{n}。レア度スコアは{score}で、0〜1,000,000の全整数の上位{percent}%（同点を含む）です。",
    "{date} RNGDLE.ART 고정 시드 숫자 선택의 정답은 {n}이며 희귀도 점수는 {score}입니다. 0부터 1,000,000까지의 모든 정수 중 동점을 포함한 상위 {percent}%입니다.",
    "Die RNGDLE.ART-Fünferauswahl mit Datumssaat für {date} gewinnt {n} mit {score} Punkten: Top {percent}% aller ganzen Zahlen von 0 bis 1.000.000, einschließlich Gleichständen.",
    "La réponse au choix RNGDLE.ART à graine fixe du {date} est {n}, avec un score de {score} : parmi les {percent}% les mieux notés de tous les entiers de 0 à 1 000 000, ex æquo inclus.",
  ],
  draftWinner: [
    "Draft winner",
    "五选一答案",
    "5択の正解",
    "숫자 선택 정답",
    "Gewinner der Fünferauswahl",
    "Gagnant du choix de nombres",
  ],
  published: [
    "Published",
    "发布日期",
    "公開日時",
    "게시 일시",
    "Veröffentlicht",
    "Publié",
  ],
  modified: [
    "Updated",
    "更新日期",
    "更新日時",
    "수정 일시",
    "Aktualisiert",
    "Mis à jour",
  ],
  archive: [
    "RNGDLE Daily Answers Archive",
    "RNGDLE 每日答案归档",
    "RNGDLE デイリー解答アーカイブ",
    "RNGDLE 일일 정답 보관함",
    "RNGDLE Tageslösungsarchiv",
    "Archives des solutions quotidiennes RNGDLE",
  ],
  archiveDescription: [
    "Browse published RNGDLE.ART daily solutions by UTC date: five-number draft, ten comparison pairs and the 30-card hunt, with exact rarity scores.",
    "按 UTC 日期浏览已发布的 RNGDLE.ART 每日答案：五选一、十组数字对比和 30 张牌搜寻，附精确稀有度分数。",
    "UTC日付別のRNGDLE.ART解答。5択、10組の比較、30枚の探索を正確なレア度スコア付きで確認できます。",
    "UTC 날짜별 RNGDLE.ART 정답을 확인하세요. 숫자 5개 선택, 10쌍 비교, 카드 30개 탐색과 정확한 희귀도 점수를 제공합니다.",
    "Veröffentlichte RNGDLE.ART-Lösungen nach UTC-Datum: Fünferauswahl, zehn Vergleiche und 30 Karten mit exakten Seltenheitswerten.",
    "Solutions RNGDLE.ART publiées par date UTC : choix parmi cinq nombres, dix comparaisons et chasse de 30 cartes, avec scores exacts.",
  ],
  description: [
    "RNGDLE.ART solutions for {date}: the active daily challenge, all five draft candidates, ten comparison answers and the 30-card hunt with exact scores.",
    "{date} 的 RNGDLE.ART 答案：当天正式挑战、五个候选数字、十组对比答案和 30 张牌的精确得分。",
    "{date}のRNGDLE.ART解答。実施中のデイリー、5候補、10組の比較、30枚の探索を正確なスコアで解説。",
    "{date} RNGDLE.ART 정답: 오늘의 도전, 후보 숫자 5개, 비교 10쌍, 카드 30개의 정확한 점수.",
    "RNGDLE.ART-Lösungen für {date}: aktiver Tagesmodus, fünf Kandidaten, zehn Vergleiche und 30 Karten mit exakten Werten.",
    "Solutions RNGDLE.ART du {date} : défi actif, cinq candidats, dix comparaisons et 30 cartes avec leurs scores exacts.",
  ],
  activeSentence: [
    "On {date}, RNGDLE.ART’s active daily challenge is {mode}.",
    "{date}，RNGDLE.ART 当天的正式挑战为“{mode}”。",
    "{date}のRNGDLE.ARTデイリーモードは「{mode}」です。",
    "{date} RNGDLE.ART의 일일 도전은 {mode}입니다.",
    "Am {date} ist {mode} der aktive RNGDLE.ART-Tagesmodus.",
    "Le {date}, le défi quotidien actif de RNGDLE.ART est {mode}.",
  ],
  winnerSentence: [
    "Its highest-scoring number is {n}, scoring {score}.",
    "该模式的最高分数字是 {n}，得分 {score}。",
    "このモードの最高得点の数字は{n}、スコアは{score}です。",
    "해당 모드의 최고 점수 숫자는 {n}이며 점수는 {score}입니다.",
    "Die höchstbewertete Zahl darin ist {n} mit {score} Punkten.",
    "Son nombre au score le plus élevé est {n}, avec {score} points.",
  ],
  quizSentence: [
    "The ten winning picks, in order, are {numbers}.",
    "十组对比的正确选择依次为：{numbers}。",
    "10組の正解は順に{numbers}です。",
    "10쌍의 정답은 순서대로 {numbers}입니다.",
    "Die zehn richtigen Antworten lauten der Reihe nach: {numbers}.",
    "Les dix choix gagnants, dans l’ordre, sont : {numbers}.",
  ],
  topSentence: [
    "Across all three seeded modes, {n} has the highest score of {score}, in the top {percent}% of the full range (ties included).",
    "三个固定种子模式中，{n} 以 {score} 分居首，属于全区间得分最高的 {percent}%（包含并列）。",
    "3つの固定シードモード全体では{n}が{score}点で最高。全範囲の上位{percent}%（同点を含む）です。",
    "세 고정 시드 모드 전체에서 {n}이 {score}점으로 가장 높으며, 동점 포함 전체 범위의 상위 {percent}%입니다.",
    "Über alle drei gesetzten Modi erreicht {n} mit {score} Punkten die Top {percent}% des gesamten Bereichs, einschließlich Gleichständen.",
    "Sur les trois modes à graine fixe, {n} obtient le meilleur score de {score}, parmi les {percent}% les mieux notés du domaine, ex æquo inclus.",
  ],
  active: [
    "Active daily challenge",
    "当天正式挑战",
    "本日のデイリーチャレンジ",
    "오늘의 일일 도전",
    "Aktiver Tagesmodus",
    "Défi quotidien actif",
  ],
  seeded: [
    "Seeded solution for this date",
    "该日期的固定种子解答",
    "この日付の固定シード解答",
    "이 날짜의 고정 시드 정답",
    "Lösung mit Datumssaat",
    "Solution déterminée par la date",
  ],
  scope: [
    "One mode rotates into the daily challenge each UTC day. The other two sections show solutions generated with the same date and their own mode seeds. These are RNGDLE.ART solutions, independent of similarly named games.",
    "每日正式挑战按 UTC 日期轮换一个模式。其他两个部分展示相同日期、各自模式种子生成的解答。这些答案属于独立的 RNGDLE.ART，与其他同名游戏无关。",
    "UTC日付ごとに1モードがデイリーになります。他の2節は同じ日付と各モード固有のシードによる解答です。RNGDLE.ARTは同名の他ゲームとは独立しています。",
    "UTC 날짜마다 한 모드가 일일 도전으로 순환합니다. 나머지 두 모드는 같은 날짜와 각 모드의 시드로 생성한 정답입니다. RNGDLE.ART는 유사한 이름의 게임과 독립적입니다.",
    "Pro UTC-Tag ist ein Modus aktiv. Die beiden anderen Abschnitte zeigen Lösungen mit demselben Datum und eigenem Modus-Seed. RNGDLE.ART ist von ähnlich benannten Spielen unabhängig.",
    "Un mode devient le défi du jour à chaque date UTC. Les deux autres sections utilisent la même date et la graine propre à leur mode. RNGDLE.ART est indépendant des jeux aux noms similaires.",
  ],
  number: ["Number", "数字", "数字", "숫자", "Zahl", "Nombre"],
  score: [
    "Rarity score",
    "稀有度分数",
    "レア度スコア",
    "희귀도 점수",
    "Seltenheitswert",
    "Score de rareté",
  ],
  result: ["Solution", "答案", "解答", "정답", "Lösung", "Solution"],
  winner: [
    "Highest score",
    "最高分",
    "最高得点",
    "최고 점수",
    "Höchster Wert",
    "Meilleur score",
  ],
  card: ["Card", "牌序", "カード", "카드", "Karte", "Carte"],
  round: ["Pair", "组别", "組", "쌍", "Paar", "Paire"],
  tie: [
    "Tie: the game awards neither choice a win",
    "并列：游戏中两个选项均不计为答对",
    "同点：どちらも正解扱いになりません",
    "동점: 게임에서는 어느 선택도 정답으로 처리하지 않습니다",
    "Gleichstand: Keine Wahl wird als richtig gewertet",
    "Égalité : aucun choix n’est compté comme gagnant",
  ],
  top: [
    "Highest score across the seeded modes",
    "固定种子模式的最高分数字",
    "固定シードモード全体の最高得点",
    "고정 시드 모드 전체 최고 점수",
    "Höchster Wert aller gesetzten Modi",
    "Meilleur score des modes à graine fixe",
  ],
  matched: [
    "Patterns matched by this number",
    "该数字命中的模式",
    "この数字に一致するパターン",
    "이 숫자의 패턴",
    "Muster dieser Zahl",
    "Motifs de ce nombre",
  ],
  highlight: [
    "Pattern highlight",
    "模式精选",
    "注目パターン",
    "주목할 패턴",
    "Muster im Fokus",
    "Motif à découvrir",
  ],
  highlightNote: [
    "The least frequent matched pattern of the highest-scoring seeded number; an editorial highlight, not another game mode.",
    "取固定种子模式最高分数字所命中、全区间数量最少的模式，作为内容精选，并非额外的游戏模式。",
    "最高得点の数字に一致するうち最も出現数が少ないパターンを紹介。追加のゲームモードではありません。",
    "최고 점수 숫자의 패턴 중 가장 드문 것을 소개합니다. 별도의 게임 모드는 아닙니다.",
    "Das seltenste passende Muster der höchstbewerteten Zahl wird redaktionell hervorgehoben; es ist kein weiterer Spielmodus.",
    "Le motif le moins fréquent du nombre au meilleur score est mis en avant à titre éditorial ; ce n’est pas un mode supplémentaire.",
  ],
  how: [
    "How these answers are calculated",
    "答案如何计算",
    "解答の計算方法",
    "정답 계산 방법",
    "So entstehen die Lösungen",
    "Calcul des solutions",
  ],
  calculation: [
    "The published engine generates each date’s deck deterministically. Answers select the highest exact rarity score in a draft, a hunt deck or each comparison pair. Frequencies come from every integer from 0 through 1,000,000. A smaller top percentage means a rarer score; ties are included.",
    "引擎按日期确定性生成牌组，在五选一、搜寻牌堆或每组对比中选择精确稀有度分数最高的数字。频率基于从 0 到 1,000,000 的全部整数计算。前百分比越小，分数越稀有，统计包含并列。",
    "エンジンは日付から決定的に数字を生成し、選択肢・探索デッキ・各比較で最も高い正確なレア度スコアを選びます。頻度は0〜1,000,000の全整数から計算。上位割合が小さいほど珍しく、同点を含みます。",
    "엔진은 날짜에 따라 숫자를 결정적으로 생성합니다. 선택 후보, 탐색 카드 또는 비교 쌍에서 정확한 희귀도 점수가 가장 높은 숫자를 고릅니다. 빈도는 0부터 1,000,000까지 모든 정수로 계산하며 상위 비율이 작을수록 희귀합니다. 동점을 포함합니다.",
    "Die Engine erzeugt Zahlen deterministisch aus dem Datum. Die Lösung ist jeweils der höchste exakte Seltenheitswert. Die Häufigkeiten umfassen alle ganzen Zahlen von 0 bis 1.000.000. Ein kleinerer Top-Prozentsatz bedeutet mehr Seltenheit; Gleichstände zählen mit.",
    "Le moteur génère les nombres de façon déterministe selon la date. La solution est le score exact le plus élevé de chaque choix, paquet ou paire. Les fréquences couvrent tous les entiers de 0 à 1 000 000. Un pourcentage supérieur plus petit indique une plus grande rareté, ex æquo inclus.",
  ],
  faq: [
    "Frequently asked questions",
    "常见问题",
    "よくある質問",
    "자주 묻는 질문",
    "Häufige Fragen",
    "Questions fréquentes",
  ],
  answerQuestion: [
    "What is the RNGDLE.ART daily answer for {date}?",
    "{date} 的 RNGDLE.ART 每日答案是什么？",
    "{date}のRNGDLE.ARTデイリー解答は？",
    "{date} RNGDLE.ART 일일 정답은 무엇인가요?",
    "Wie lautet die RNGDLE.ART-Tageslösung am {date}?",
    "Quelle est la solution RNGDLE.ART du {date} ?",
  ],
  resetQuestion: [
    "When does the daily challenge reset?",
    "每日挑战何时重置？",
    "デイリーの更新時刻は？",
    "일일 도전은 언제 초기화되나요?",
    "Wann wird der Tagesmodus erneuert?",
    "Quand le défi quotidien est-il renouvelé ?",
  ],
  resetAnswer: [
    "The challenge resets at 00:00 UTC. All players use the same date and engine version. Practice rounds use a different seed and are not covered by this archive.",
    "每日挑战在 UTC 00:00 重置，所有玩家使用同一日期和引擎版本。练习局使用不同种子，不属于本归档。",
    "UTC 00:00に更新され、全プレイヤーが同じ日付とエンジンを使います。練習は別のシードを使うため、このアーカイブには含みません。",
    "UTC 00:00에 초기화되며 모든 플레이어는 같은 날짜와 엔진 버전을 사용합니다. 연습은 다른 시드를 사용하므로 이 보관함에 포함되지 않습니다.",
    "Der Wechsel erfolgt um 00:00 UTC. Alle spielen mit demselben Datum und derselben Engine-Version. Übungsrunden verwenden andere Seeds und sind hier nicht enthalten.",
    "Le défi change à 00:00 UTC. Tous utilisent la même date et version du moteur. L’entraînement emploie une autre graine et ne figure pas dans ces archives.",
  ],
  calculationQuestion: [
    "How is the daily rarest number chosen?",
    "如何选出每日最稀有数字？",
    "毎日の最もレアな数字はどう選ぶ？",
    "매일 가장 희귀한 숫자는 어떻게 정하나요?",
    "Wie wird die seltenste Tageszahl gewählt?",
    "Comment le nombre le plus rare du jour est-il choisi ?",
  ],
  previous: [
    "Previous answer",
    "前一天答案",
    "前の解答",
    "이전 정답",
    "Vorherige Lösung",
    "Solution précédente",
  ],
  next: [
    "Next answer",
    "后一天答案",
    "次の解答",
    "다음 정답",
    "Nächste Lösung",
    "Solution suivante",
  ],
  latest: [
    "Latest published answer",
    "最新已发布答案",
    "最新の公開解答",
    "최근 공개 정답",
    "Neueste veröffentlichte Lösung",
    "Dernière solution publiée",
  ],
  page: [
    "Page {page}",
    "第 {page} 页",
    "{page}ページ",
    "{page}페이지",
    "Seite {page}",
    "Page {page}",
  ],
  newer: [
    "Newer answers",
    "较新答案",
    "新しい解答",
    "최근 정답",
    "Neuere Lösungen",
    "Solutions plus récentes",
  ],
  older: [
    "Older answers",
    "更早答案",
    "古い解答",
    "이전 정답",
    "Ältere Lösungen",
    "Solutions plus anciennes",
  ],
  archiveNote: [
    "Only published dates are linked. Archives begin with the project launch on September 26, 2026; future solutions are not published.",
    "仅链接已发布日期。归档从项目上线日 2026 年 9 月 26 日开始，不发布未来答案。",
    "公開済みの日付のみ掲載。開始日は2026年9月26日で、未来の解答は公開しません。",
    "공개된 날짜만 연결합니다. 보관함은 프로젝트 시작일인 2026년 9월 26일부터 제공하며 미래 정답은 게시하지 않습니다.",
    "Verlinkt werden nur veröffentlichte Tage ab dem Projektstart am 26. September 2026. Zukünftige Lösungen werden nicht veröffentlicht.",
    "Seules les dates publiées sont liées, depuis le lancement du 26 septembre 2026. Aucune solution future n’est publiée.",
  ],
  version: [
    "Snapshot engine",
    "快照引擎",
    "保存時のエンジン",
    "스냅샷 엔진",
    "Snapshot-Engine",
    "Moteur de l’instantané",
  ],
};

export function dailyText(
  locale: Locale,
  key: string,
  values: Record<string, string | number> = {},
) {
  let result = text[key][locales.indexOf(locale)];
  for (const [name, value] of Object.entries(values))
    result = result.replaceAll("{" + name + "}", String(value));
  return result;
}

export function dailyDate(locale: Locale, day: string, monthOnly = false) {
  return new Intl.DateTimeFormat(htmlLangs[locales.indexOf(locale)], {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    ...(monthOnly ? {} : { day: "numeric" as const }),
  }).format(new Date(day + "T00:00:00Z"));
}

export function dailyContent(locale: Locale, data: DailySnapshot) {
  const tr = (key: string, values: Record<string, string | number> = {}) =>
    dailyText(locale, key, values);
  const number = (value: number, digits = 0) =>
    new Intl.NumberFormat(htmlLangs[locales.indexOf(locale)], {
      maximumFractionDigits: digits,
    }).format(value);
  const date = dailyDate(locale, data.date);
  const active = tr("activeSentence", {
    date,
    mode: translate(locale, data.officialMode),
  });
  const result =
    data.officialMode === "quiz"
      ? tr("quizSentence", {
          numbers: data.modes.quiz.rounds
            .map((round) => (round.winner ? number(round.winner.n) : tr("tie")))
            .join(" · "),
        })
      : tr("winnerSentence", {
          n: number(data.modes[data.officialMode].winner.n),
          score: number(data.modes[data.officialMode].winner.score),
        });
  const summary = active + " " + result;
  const draftSummary = tr("draftSummary", {
    date,
    n: number(data.modes.draft.winner.n),
    score: number(data.modes.draft.winner.score),
    percent: number(data.modes.draft.winner.percent, 6),
  });
  const topSummary = tr("topSentence", {
    n: number(data.topNumber.n),
    score: number(data.topNumber.score),
    percent: number(data.topNumber.percent, 6),
  });
  const h1 = tr("answer") + " — " + date;
  return {
    title: h1 + " (" + tr("titleSuffix") + ")",
    description: tr("description", { date }),
    h1,
    summary,
    draftSummary,
    topSummary,
    faqs: [
      {
        question: tr("answerQuestion", { date }),
        answer: draftSummary + " " + summary,
      },
      { question: tr("resetQuestion"), answer: tr("resetAnswer") },
      { question: tr("calculationQuestion"), answer: tr("calculation") },
    ],
  };
}

export function archiveContent(locale: Locale, page = 1) {
  const h1 =
    dailyText(locale, "archive") +
    (page > 1 ? " — " + dailyText(locale, "page", { page }) : "");
  return {
    title: h1,
    h1,
    description: dailyText(locale, "archiveDescription"),
    summary: dailyText(locale, "archiveNote"),
    faqs: [],
  };
}
