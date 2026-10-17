/*
  Usap Tayo — phrase library
  ==========================
  Each phrase is a plain object. To add or fix a phrase, edit this file —
  no other code needs to change. The data test (src/data/data.test.js)
  checks that every entry has the required fields.

  Fields
  ------
  id            unique, kebab-case. Never change an id once you've used the app,
                or that phrase's saved progress will be orphaned.
  category      one of the ids in categories.js
  tagalog       the phrase as written
  english       natural English meaning
  literal       (optional) word-for-word meaning, when it differs
  pronunciation approximate guide — syllables split by "-", STRESSED syllable in CAPS
  spoken        (optional) what the audio says, when it differs from `tagalog`: fills in
                blanks, or puts very short words in a short phrase (the computer voice
                garbles single isolated words). Shown in the app as "Audio says: …".
  example       { tagalog, english } — a sentence you might actually say
  usage         when/how to use it, and when it might sound too formal or casual
  register      respectful | neutral | casual | slang | taglish (see categories.js)
  withName      (optional) a version using the name from your Profile; "{name}" is replaced
  verify        (optional) a note flagging something that should be double-checked
                with a native speaker. Shown in the app as "Check with family".

  Pronunciation guides are APPROXIMATIONS written for English speakers.
  Vowels: a = "ah", e = "eh", i = "ee", o = "oh", u = "oo".
  "ng" is one sound, like the end of "sing" — even at the start of a word.
*/

export const PHRASES = [
  // ───────────── Greetings & introductions ─────────────
  {
    id: 'kumusta-ka',
    category: 'greetings',
    tagalog: 'Kumusta ka?',
    english: 'How are you? (casual)',
    pronunciation: 'koo-MOOS-tah kah',
    example: { tagalog: 'Uy, insan! Kumusta ka na?', english: 'Hey, cuz! How have you been?' },
    usage:
      'Everyday greeting for siblings, cousins, friends, or anyone your age or younger. Adding “na” (Kumusta ka na?) means “How have you been?” — great when you haven’t seen someone in a while. Also spelled “Kamusta.”',
    register: 'casual',
  },
  {
    id: 'kumusta-po-kayo',
    category: 'greetings',
    tagalog: 'Kumusta po kayo?',
    english: 'How are you? (respectful)',
    pronunciation: 'koo-MOOS-tah poh kah-YOH',
    example: {
      tagalog: 'Magandang hapon po, Tita! Kumusta po kayo?',
      english: 'Good afternoon, Auntie! How are you?',
    },
    usage:
      'Use with parents, grandparents, aunts, uncles, and anyone older. “Po” is a respect marker, and “kayo” (the plural “you”) is used for one person to show extra respect.',
    register: 'respectful',
  },
  {
    id: 'mabuti-naman',
    category: 'greetings',
    tagalog: 'Mabuti naman po.',
    english: 'I’m doing well.',
    literal: 'Good, (as for me).',
    pronunciation: 'mah-BOO-tee nah-MAHN poh',
    example: { tagalog: 'Mabuti naman po. Kayo po?', english: 'I’m doing well. And you?' },
    usage:
      'The standard answer to “Kumusta?”. “Naman” softens it. Drop the “po” with people your age. A more casual answer is “Okay lang” (I’m okay).',
    register: 'respectful',
  },
  {
    id: 'magandang-umaga',
    category: 'greetings',
    tagalog: 'Magandang umaga po.',
    english: 'Good morning.',
    literal: 'Beautiful morning.',
    pronunciation: 'mah-gahn-DAHNG oo-MAH-gah poh',
    example: { tagalog: 'Magandang umaga po, Lola!', english: 'Good morning, Grandma!' },
    usage:
      'Swap “umaga” (morning) for “hapon” (HAH-pon, afternoon) or “gabi” (gah-BEE, evening). Keep “po” for elders. In many families people simply say “Good morning” in English too — both are normal.',
    register: 'respectful',
  },
  {
    id: 'mano-po',
    category: 'greetings',
    tagalog: 'Mano po.',
    english: '(Asking for an elder’s blessing)',
    literal: 'Hand, please.',
    pronunciation: 'MAH-noh poh',
    example: {
      tagalog: 'Mano po, Lolo.',
      english: '(Taking Lolo’s hand to your forehead) Bless me, Grandpa.',
    },
    usage:
      'Said while gently taking an elder’s hand and touching the back of it to your forehead — a sign of respect when you arrive or leave. Elders often reply “Kaawaan ka ng Diyos” (God bless you) or simply “God bless.” Some families say “Bless po” instead.',
    register: 'respectful',
  },
  {
    id: 'ako-si',
    category: 'greetings',
    tagalog: 'Ako si ___.',
    spoken: 'Ako si Ana.',
    withName: 'Ako po si {name}.',
    english: 'I’m ___. (introducing yourself)',
    pronunciation: 'ah-KOH see ___',
    example: { tagalog: 'Ako po si Ana, anak ni Rosa.', english: 'I’m Ana, Rosa’s daughter.' },
    usage:
      'Introduce yourself with your name. With relatives who don’t know you well, adding whose child you are (“anak ni ___”) helps them place you in the family.',
    register: 'neutral',
  },
  {
    id: 'ingat',
    category: 'greetings',
    tagalog: 'Ingat!',
    spoken: 'Ingat po kayo!',
    english: 'Take care!',
    pronunciation: 'ee-NGAHT',
    example: { tagalog: 'Sige po, ingat po kayo!', english: 'Okay, take care!' },
    usage:
      'The most common way to say goodbye. “Paalam” (pah-AH-lahm, goodbye) exists but can sound formal or very final in daily conversation — most people say “Sige, ingat!” or just “Bye!”',
    register: 'casual',
  },

  // ───────────── Family & relationships ─────────────
  {
    id: 'nanay-tatay',
    category: 'family',
    tagalog: 'Nanay / Tatay',
    spoken: 'Si Nanay at si Tatay.',
    english: 'Mom / Dad',
    pronunciation: 'NAH-nigh / TAH-tie',
    example: { tagalog: 'Nay, nandito na po ako!', english: 'Mom, I’m home!' },
    usage:
      'Common words for mother and father. When calling them, people often shorten to “Nay” and “Tay.” Many families use Mama/Papa, Mommy/Daddy, Ma/Pa, or Inay/Itay instead — use whatever your family uses.',
    register: 'neutral',
  },
  {
    id: 'lola-lolo',
    category: 'family',
    tagalog: 'Lola / Lolo',
    spoken: 'Si Lola at si Lolo.',
    english: 'Grandma / Grandpa',
    pronunciation: 'LOH-lah / LOH-loh',
    example: {
      tagalog: 'Lola, gusto n’yo po ba ng kape?',
      english: 'Grandma, would you like some coffee?',
    },
    usage:
      'Grandmother and grandfather. Also used respectfully for any elderly person. Your grandparents may call you “apo” (grandchild).',
    register: 'neutral',
  },
  {
    id: 'tita-tito',
    category: 'family',
    tagalog: 'Tita / Tito',
    spoken: 'Si Tita at si Tito.',
    english: 'Aunt / Uncle',
    pronunciation: 'TEE-tah / TEE-toh',
    example: { tagalog: 'Tito, salamat po sa regalo!', english: 'Uncle, thank you for the gift!' },
    usage:
      'For actual aunts and uncles — and also for your parents’ close friends and other older adults, as a sign of respect and closeness.',
    register: 'neutral',
  },
  {
    id: 'ate-kuya',
    category: 'family',
    tagalog: 'Ate / Kuya',
    spoken: 'Si Ate at si Kuya.',
    english: 'Older sister / Older brother',
    pronunciation: 'AH-teh / KOO-yah',
    example: { tagalog: 'Kuya, pahiram po ng charger.', english: 'Kuya, can I borrow your charger?' },
    usage:
      'For older siblings and cousins — and politely for any young adult a bit older than you (a server, a driver). In many families, calling an older sibling by just their name can feel disrespectful.',
    register: 'neutral',
  },
  {
    id: 'anak-apo',
    category: 'family',
    tagalog: 'Anak / Apo',
    spoken: 'Ang anak ko at ang apo ko.',
    english: 'Child (son or daughter) / Grandchild',
    pronunciation: 'ah-NAHK / AH-poh',
    example: { tagalog: 'Apo, halika rito.', english: 'Come here, grandchild.' },
    usage:
      'What your parents and grandparents may call you. Older relatives like aunts also use “anak” affectionately for any younger family member.',
    register: 'neutral',
  },
  {
    id: 'pinsan',
    category: 'family',
    tagalog: 'Pinsan',
    spoken: 'Ang pinsan ko.',
    english: 'Cousin',
    pronunciation: 'pin-SAHN',
    example: {
      tagalog: 'Siya ang pinsan ko sa side ni Tatay.',
      english: 'That’s my cousin on Dad’s side.',
    },
    usage:
      'Cousin. Cousins often call each other “insan” as a casual nickname. Notice the example mixes in English (“side”) — very normal.',
    register: 'neutral',
  },
  {
    id: 'mahal-kita',
    category: 'family',
    tagalog: 'Mahal kita.',
    english: 'I love you.',
    pronunciation: 'mah-HAHL kee-TAH',
    example: { tagalog: 'Mahal na mahal ko po kayo, Nay.', english: 'I love you so much, Mom.' },
    usage:
      'The standard “I love you.” For parents and elders, “Mahal ko po kayo” is more respectful. Repeating it (“mahal na mahal”) means “so much.” Fun fact: “mahal” also means “expensive”!',
    register: 'neutral',
  },

  // ───────────── Everyday conversation ─────────────
  {
    id: 'salamat',
    category: 'everyday',
    tagalog: 'Salamat po.',
    english: 'Thank you.',
    pronunciation: 'sah-LAH-maht poh',
    example: { tagalog: 'Maraming salamat po, Tita!', english: 'Thank you very much, Auntie!' },
    usage:
      'Keep “po” for elders; just “Salamat!” with friends. “Maraming salamat” (mah-RAH-meeng) = thank you very much.',
    register: 'respectful',
  },
  {
    id: 'walang-anuman',
    category: 'everyday',
    tagalog: 'Walang anuman.',
    english: 'You’re welcome.',
    literal: 'It’s nothing.',
    pronunciation: 'wah-LAHNG ah-noo-MAHN',
    example: { tagalog: '“Salamat!” — “Walang anuman.”', english: '“Thanks!” — “You’re welcome.”' },
    usage:
      'A polite reply to thanks. In casual conversation people more often say “Wala ’yon” (wah-LAH yohn, “It’s nothing”) or just “Sige.”',
    register: 'neutral',
  },
  {
    id: 'oo-opo',
    category: 'everyday',
    tagalog: 'Oo / Opo',
    spoken: 'Oo. Opo.',
    english: 'Yes / Yes (respectful)',
    pronunciation: 'OH-oh / OH-poh',
    example: { tagalog: '“Kumain ka na?” — “Opo, Lola.”', english: '“Have you eaten?” — “Yes, Grandma.”' },
    usage:
      '“Oo” is a plain yes. With parents, grandparents, and other elders, say “Opo” — answering an elder with a plain “oo” can sound rude. The respectful “no” is “Hindi po.”',
    register: 'respectful',
  },
  {
    id: 'hindi',
    category: 'everyday',
    tagalog: 'Hindi po.',
    english: 'No. / Not.',
    pronunciation: 'hin-DEE poh',
    example: { tagalog: 'Hindi pa po ako gutom.', english: 'I’m not hungry yet.' },
    usage:
      '“Hindi” means both “no” and “not.” It ends with a slight catch in the throat (a glottal stop), like the break in “uh-oh.” Drop the “po” with people your age.',
    register: 'respectful',
  },
  {
    id: 'sige',
    category: 'everyday',
    tagalog: 'Sige.',
    spoken: 'Sige po.',
    english: 'Okay. / Sure. / Go ahead.',
    pronunciation: 'SEE-geh',
    example: { tagalog: 'Sige po, ako na ang bahala.', english: 'Okay, I’ll take care of it.' },
    usage:
      'One of the most useful words: agreeing (“sure”), giving permission (“go ahead”), or wrapping up a conversation (“okay then, bye”). “Sige na” can mean “come on, please.”',
    register: 'casual',
  },
  {
    id: 'pasensya-na',
    category: 'everyday',
    tagalog: 'Pasensya na po.',
    english: 'Sorry. / Excuse me.',
    literal: 'Patience, please.',
    pronunciation: 'pah-SEN-shah nah poh',
    example: { tagalog: 'Pasensya na po, na-late ako.', english: 'Sorry, I was late.' },
    usage:
      'A soft “sorry” for small mistakes or inconveniences. “Patawad” (forgive me) is a much deeper apology and sounds heavy for small things. Also spelled “pasensiya.”',
    register: 'respectful',
  },
  {
    id: 'okay-lang',
    category: 'everyday',
    tagalog: 'Okay lang.',
    english: 'I’m okay. / It’s fine.',
    literal: 'Just okay.',
    pronunciation: 'oh-KAY lahng',
    example: { tagalog: '“Okay ka lang?” — “Okay lang ako.”', english: '“Are you okay?” — “I’m fine.”' },
    usage:
      'A super common answer to “Kumusta?” or a way to reassure someone. Ask “Okay ka lang?” to check on someone. Add “po” for elders: “Okay lang po.”',
    register: 'casual',
  },

  // ───────────── Questions & answers ─────────────
  {
    id: 'kumain-ka-na',
    category: 'questions',
    tagalog: 'Kumain ka na?',
    english: 'Have you eaten?',
    pronunciation: 'koo-mah-EEN kah nah',
    example: { tagalog: 'Nay, kumain na po kayo?', english: 'Mom, have you eaten?' },
    usage:
      'Filipinos often ask this as a caring greeting, not only a question about food. Asking an elder “Kumain na po kayo?” is a simple way to show you care.',
    register: 'neutral',
  },
  {
    id: 'hindi-ko-maintindihan',
    category: 'questions',
    tagalog: 'Hindi ko po maintindihan.',
    english: 'I don’t understand.',
    pronunciation: 'hin-DEE koh poh mah-in-tin-dee-HAHN',
    example: {
      tagalog: 'Pasensya na po, hindi ko po naintindihan.',
      english: 'Sorry, I didn’t understand.',
    },
    usage:
      '“Maintindihan” = can’t understand (in general or right now). If you just missed what someone said, “naintindihan” (nah-in-tin-dee-HAHN) means “didn’t understand.” Both are natural — and very useful for learners!',
    register: 'respectful',
  },
  {
    id: 'pakiulit-po',
    category: 'questions',
    tagalog: 'Pakiulit po.',
    english: 'Please say that again.',
    literal: 'Please repeat.',
    pronunciation: 'pah-kee-oo-LEET poh',
    example: {
      tagalog: 'Pakiulit po, Lola? Hindi ko po narinig.',
      english: 'Could you say that again, Grandma? I didn’t hear.',
    },
    usage:
      '“Paki-” turns a verb into a polite request (“please ___”). You can also ask “Ano po ulit?” — “What was that again?”',
    register: 'respectful',
  },
  {
    id: 'pakibagalan',
    category: 'questions',
    tagalog: 'Pakibagalan lang po.',
    english: 'Please slow down a little.',
    pronunciation: 'pah-kee-bah-gah-LAHN lahng poh',
    example: {
      tagalog: 'Tito, pakibagalan lang po. Nag-aaral pa po ako ng Tagalog.',
      english: 'Uncle, please slow down a little. I’m still learning Tagalog.',
    },
    usage:
      'Ask someone to speak more slowly. “Lang” softens it (“just a bit”). Another common way: “Dahan-dahan lang po” (slowly, please).',
    register: 'respectful',
    verify: 'Stress placement in “pakibagalan” is a best guess — ask a family member to say it for you.',
  },
  {
    id: 'ano-ibig-sabihin',
    category: 'questions',
    tagalog: 'Ano po ang ibig sabihin ng ___?',
    spoken: 'Ano po ang ibig sabihin ng kilig?',
    english: 'What does ___ mean?',
    pronunciation: 'ah-NOH poh ahng EE-big sah-bee-HEEN nahng ___',
    example: {
      tagalog: 'Ano po ang ibig sabihin ng “kilig”?',
      english: 'What does “kilig” mean?',
    },
    usage:
      'Your best friend as a learner. Note: the little word “ng” is pronounced “nahng.”',
    register: 'respectful',
  },
  {
    id: 'saan-ka-pupunta',
    category: 'questions',
    tagalog: 'Saan ka pupunta?',
    english: 'Where are you going?',
    pronunciation: 'sah-AHN kah poo-POON-tah',
    example: { tagalog: '“Saan ka pupunta?” — “Diyan lang.”', english: '“Where are you going?” — “Just over there.”' },
    usage:
      'Often asked casually as a greeting when someone is heading out. A vague answer like “Diyan lang” (just over there) is perfectly normal. For elders: “Saan po kayo pupunta?”',
    register: 'casual',
  },
  {
    id: 'nasaan-po-ang',
    category: 'questions',
    tagalog: 'Nasaan po ang ___?',
    spoken: 'Nasaan po ang susi?',
    english: 'Where is the ___?',
    pronunciation: 'nah-sah-AHN poh ahng ___',
    example: { tagalog: 'Nasaan po ang susi?', english: 'Where are the keys?' },
    usage:
      'Ask where something is. For a person, use “si” instead of “ang”: “Nasaan po si Lola?” (Where’s Grandma?)',
    register: 'respectful',
  },

  // ───────────── Food & eating ─────────────
  {
    id: 'kain-tayo',
    category: 'food',
    tagalog: 'Kain tayo!',
    english: 'Let’s eat!',
    pronunciation: 'kah-EEN TAH-yoh',
    example: { tagalog: 'Kain na tayo! Handa na ang pagkain.', english: 'Let’s eat! The food is ready.' },
    usage:
      'An invitation to eat. Filipinos often say it to anyone nearby — even people just passing by — as a gesture of hospitality, not always a literal invitation.',
    register: 'casual',
  },
  {
    id: 'gutom-na-ako',
    category: 'food',
    tagalog: 'Gutom na ako.',
    english: 'I’m hungry.',
    pronunciation: 'goo-TOHM nah ah-KOH',
    example: { tagalog: 'Ma, gutom na po ako. Ano’ng ulam?', english: 'Mom, I’m hungry. What’s for dinner?' },
    usage: '“Na” here means “now / already.” Often shortened in speech to “Gutom na ’ko.”',
    register: 'casual',
  },
  {
    id: 'busog-na-ako',
    category: 'food',
    tagalog: 'Busog na po ako.',
    english: 'I’m full.',
    pronunciation: 'boo-SOHG nah poh ah-KOH',
    example: {
      tagalog: 'Busog na po ako, salamat po!',
      english: 'I’m full, thank you!',
    },
    usage: 'Essential when Lola keeps refilling your plate! Pairing it with “salamat po” keeps it gracious.',
    register: 'respectful',
  },
  {
    id: 'ang-sarap',
    category: 'food',
    tagalog: 'Ang sarap!',
    english: 'It’s so delicious!',
    pronunciation: 'ahng sah-RAHP',
    example: { tagalog: 'Ang sarap po ng adobo n’yo!', english: 'Your adobo is so good!' },
    usage:
      'Compliment the cook! “Sarap” is deliciousness or pleasure, so you can also use it for anything enjoyable — like a good nap.',
    register: 'neutral',
  },
  {
    id: 'pakiabot',
    category: 'food',
    tagalog: 'Pakiabot po ng ___.',
    spoken: 'Pakiabot po ng kanin.',
    english: 'Please pass the ___.',
    pronunciation: 'pah-kee-AH-boht poh nahng ___',
    example: { tagalog: 'Pakiabot po ng kanin.', english: 'Please pass the rice.' },
    usage: 'Table manners in one phrase. “Paki-” = please; “abot” = reach/hand over.',
    register: 'respectful',
  },
  {
    id: 'ano-ulam',
    category: 'food',
    tagalog: 'Ano’ng ulam?',
    english: 'What’s the main dish?',
    pronunciation: 'ah-NOHNG oo-LAHM',
    example: { tagalog: 'Nay, ano’ng ulam natin?', english: 'Mom, what are we having (with rice)?' },
    usage:
      '“Ulam” is whatever you eat with rice — meat, fish, or vegetables. “Kanin” (kah-NEEN) is cooked rice. A classic question when you get home. “Ano’ng” is short for “Ano ang.”',
    register: 'casual',
  },

  // ───────────── Feelings & emotions ─────────────
  {
    id: 'masaya-ako',
    category: 'feelings',
    tagalog: 'Masaya ako.',
    english: 'I’m happy.',
    pronunciation: 'mah-sah-YAH ah-KOH',
    example: { tagalog: 'Masaya po ako na nandito kayo.', english: 'I’m happy you’re here.' },
    usage: '“Saya” means joy or fun. “Masaya ang party!” = The party is fun!',
    register: 'neutral',
  },
  {
    id: 'pagod-na-ako',
    category: 'feelings',
    tagalog: 'Pagod na ako.',
    english: 'I’m tired.',
    pronunciation: 'PAH-gohd nah ah-KOH',
    example: {
      tagalog: 'Pagod na po ako. Magpapahinga muna ako.',
      english: 'I’m tired. I’ll rest for a bit.',
    },
    usage: 'Handy after a long day. “Medyo pagod” = a bit tired.',
    register: 'neutral',
  },
  {
    id: 'kinakabahan',
    category: 'feelings',
    tagalog: 'Kinakabahan ako.',
    english: 'I’m nervous.',
    pronunciation: 'kee-nah-kah-bah-HAHN ah-KOH',
    example: {
      tagalog: 'Kinakabahan ako sa exam bukas.',
      english: 'I’m nervous about tomorrow’s exam.',
    },
    usage: 'From “kaba” — that nervous, pounding-heart feeling. Good before exams, or meeting relatives for the first time!',
    register: 'neutral',
    verify: 'Stress placement is approximate — confirm with a family member.',
  },
  {
    id: 'nakakahiya',
    category: 'feelings',
    tagalog: 'Nakakahiya.',
    english: 'That’s embarrassing. / I’d feel bad.',
    pronunciation: 'nah-kah-kah-hee-YAH',
    example: {
      tagalog: 'Nakakahiya po, kayo pa ang nagluto.',
      english: 'I feel bad — you even did the cooking.',
    },
    usage:
      '“Hiya” is a big Filipino concept: shyness, embarrassment, and not wanting to impose. “Nakakahiya po” is often a polite way to say “I don’t want to trouble you.”',
    register: 'neutral',
  },
  {
    id: 'salamat-sa-lahat',
    category: 'feelings',
    tagalog: 'Salamat po sa lahat.',
    english: 'Thank you for everything.',
    pronunciation: 'sah-LAH-maht poh sah lah-HAHT',
    example: {
      tagalog: 'Ma, Pa, salamat po sa lahat.',
      english: 'Mom, Dad, thank you for everything.',
    },
    usage: 'A heartfelt thank-you for parents or grandparents. Simple, sincere, and it means a lot.',
    register: 'respectful',
  },

  // ───────────── Around the house ─────────────
  {
    id: 'nandito-na-ako',
    category: 'household',
    tagalog: 'Nandito na ako!',
    english: 'I’m home!',
    literal: 'I’m here now!',
    pronunciation: 'nahn-DEE-toh nah ah-KOH',
    example: { tagalog: 'Nay! Nandito na po ako!', english: 'Mom! I’m home!' },
    usage: 'Call it out when you walk in. In speech it’s often shortened to “Andito na ’ko!”',
    register: 'casual',
  },
  {
    id: 'ako-na',
    category: 'household',
    tagalog: 'Ako na.',
    spoken: 'Ako na po.',
    english: 'I’ve got it. / Let me do it.',
    literal: 'Me, now.',
    pronunciation: 'ah-KOH nah',
    example: {
      tagalog: 'Ako na po ang maghuhugas ng pinggan.',
      english: 'I’ll wash the dishes.',
    },
    usage:
      'Volunteering to help — always appreciated at family gatherings. Also used when offering to pay or carry something.',
    register: 'neutral',
  },
  {
    id: 'tulungan-kita',
    category: 'household',
    tagalog: 'Tulungan kita.',
    english: 'Let me help you.',
    pronunciation: 'too-LOO-ngahn kee-TAH',
    example: { tagalog: 'Tita, tulungan ko na po kayo.', english: 'Auntie, let me help you.' },
    usage: 'Offering help. For an elder, switch to the respectful form: “Tulungan ko po kayo.”',
    register: 'neutral',
  },
  {
    id: 'matutulog-na-ako',
    category: 'household',
    tagalog: 'Matutulog na ako.',
    english: 'I’m going to sleep now.',
    pronunciation: 'mah-too-too-LOHG nah ah-KOH',
    example: { tagalog: 'Matutulog na po ako. Good night po!', english: 'I’m going to bed now. Good night!' },
    usage: 'Saying good night. Many families mix in English (“Good night po!”), which is completely normal.',
    register: 'neutral',
    verify: 'Stress placement in “matutulog” is approximate — confirm with a family member.',
  },
  {
    id: 'aalis-na-ako',
    category: 'household',
    tagalog: 'Aalis na po ako.',
    english: 'I’m leaving now.',
    pronunciation: 'ah-ah-LEES nah poh ah-KOH',
    example: { tagalog: 'Aalis na po ako. Babalik ako mamaya.', english: 'I’m heading out. I’ll be back later.' },
    usage:
      'Letting the family know you’re heading out — often followed by a “mano po” with elders. Expect “Ingat!” in return.',
    register: 'respectful',
  },
  {
    id: 'kain-ka-pa',
    category: 'household',
    tagalog: 'Kain ka pa.',
    english: 'Have some more.',
    literal: 'Eat more still.',
    pronunciation: 'kah-EEN kah pah',
    example: { tagalog: '“Kain ka pa, anak.” — “Busog na po ako.”', english: '“Have some more, dear.” — “I’m full.”' },
    usage:
      'You’ll hear this a LOT from parents and grandparents. It’s an act of love — saying no politely with “Busog na po ako, salamat po” is fine.',
    register: 'casual',
  },

  // ───────────── Casual expressions & slang ─────────────
  {
    id: 'grabe',
    category: 'slang',
    tagalog: 'Grabe!',
    spoken: 'Grabe naman!',
    english: 'Wow! / That’s intense! / That’s too much!',
    pronunciation: 'GRAH-beh',
    example: { tagalog: 'Grabe, ang init ngayon!', english: 'Wow, it’s so hot today!' },
    usage:
      'An all-purpose reaction to anything extreme — good or bad. “Grabe ka!” can mean “You’re too much!” (teasing).',
    register: 'slang',
  },
  {
    id: 'ay-naku',
    category: 'slang',
    tagalog: 'Ay naku!',
    english: 'Oh my! / Oh no!',
    pronunciation: 'eye nah-KOO',
    example: { tagalog: 'Ay naku, nakalimutan ko!', english: 'Oh no, I forgot!' },
    usage:
      'A classic exclamation of surprise, worry, or exasperation — you’ll probably hear titas and lolas say it often. “Hay naku!” adds a sigh.',
    register: 'casual',
  },
  {
    id: 'talaga',
    category: 'slang',
    tagalog: 'Talaga?',
    spoken: 'Talaga po?',
    english: 'Really?',
    pronunciation: 'tah-LAH-gah',
    example: { tagalog: '“Pupunta si Lola bukas.” — “Talaga po?”', english: '“Grandma is coming tomorrow.” — “Really?”' },
    usage:
      'Show interest or surprise. As a statement, “Talaga!” means “Truly!” Add “po” with elders: “Talaga po?”',
    register: 'casual',
  },
  {
    id: 'bahala-na',
    category: 'slang',
    tagalog: 'Bahala na.',
    english: 'Whatever happens, happens.',
    pronunciation: 'bah-HAH-lah nah',
    example: { tagalog: 'Hindi ako nakapag-review… bahala na!', english: 'I couldn’t study… we’ll see what happens!' },
    usage:
      'Leaving things up to fate — hopeful or a bit careless depending on tone. Related: “Ikaw ang bahala” = “It’s up to you.”',
    register: 'casual',
  },
  {
    id: 'sana-all',
    category: 'slang',
    tagalog: 'Sana all.',
    english: 'Must be nice! (I wish that were me too.)',
    literal: 'Hopefully all.',
    pronunciation: 'SAH-nah ohl',
    example: { tagalog: '“May bago akong phone!” — “Sana all!”', english: '“I got a new phone!” — “Must be nice!”' },
    usage:
      'Internet-era slang said jokingly when someone shares good news. Playful and very informal — use with cousins and friends, not elders.',
    register: 'slang',
  },
  {
    id: 'charot',
    category: 'slang',
    tagalog: 'Charot!',
    english: 'Just kidding!',
    pronunciation: 'chah-ROHT',
    example: { tagalog: 'Ikaw na ang maghugas ng pinggan. Charot!', english: 'You do the dishes. Just kidding!' },
    usage:
      'Tacked on after a joke or tease. It comes from Filipino gay lingo and is now used widely. Often shortened to “Char!” Very informal.',
    register: 'slang',
    verify: 'Stress placement is approximate.',
  },

  // ───────────── Taglish ─────────────
  {
    id: 'miss-na-kita',
    category: 'taglish',
    tagalog: 'Miss na kita.',
    english: 'I miss you.',
    pronunciation: 'MISS nah kee-TAH',
    example: { tagalog: 'Lola, miss na miss na kita!', english: 'Grandma, I miss you so much!' },
    usage:
      'Extremely common Taglish. “Na-miss kita” = “I missed you” (when you see them again). A pure-Tagalog version, “Nangungulila ako sa iyo,” exists but sounds poetic or very formal in everyday speech.',
    register: 'taglish',
  },
  {
    id: 'nag-enjoy-ako',
    category: 'taglish',
    tagalog: 'Nag-enjoy ako!',
    english: 'I had fun! / I enjoyed it!',
    pronunciation: 'nahg-en-JOY ah-KOH',
    example: { tagalog: 'Nag-enjoy po ako, salamat po sa pag-invite!', english: 'I had fun — thanks for inviting me!' },
    usage: 'Tagalog verb prefixes attach to English verbs: “nag-” + enjoy = enjoyed (past). Great after a family party.',
    register: 'taglish',
  },
  {
    id: 'magre-review',
    category: 'taglish',
    tagalog: 'Magre-review muna ako.',
    english: 'I’ll study first.',
    pronunciation: 'mahg-reh-ree-VYOO MOO-nah ah-KOH',
    example: {
      tagalog: 'Mamaya na lang ako sasama, magre-review muna ako.',
      english: 'I’ll join later — I need to study first.',
    },
    usage:
      'For future tense, Taglish repeats the first syllable of the English verb: mag- + re + review. “Muna” = first / for now.',
    register: 'taglish',
  },
  {
    id: 'na-traffic',
    category: 'taglish',
    tagalog: 'Na-traffic ako.',
    english: 'I got stuck in traffic.',
    pronunciation: 'nah-TRAH-fik ah-KOH',
    example: { tagalog: 'Sorry po, na-traffic ako.', english: 'Sorry, I got stuck in traffic.' },
    usage: '“Na-” + English noun = something happened to you. The classic excuse for being late!',
    register: 'taglish',
  },
  {
    id: 'gets-ko-na',
    category: 'taglish',
    tagalog: 'Gets ko na.',
    english: 'I get it now.',
    pronunciation: 'GETS koh nah',
    example: { tagalog: '“Gets mo?” — “Ah, gets ko na!”', english: '“Do you get it?” — “Oh, I get it now!”' },
    usage: 'From English “get.” “Gets mo?” = Do you get it? Casual — with elders, “Naintindihan ko na po” is more respectful.',
    register: 'taglish',
  },
];

export function getPhrase(id) {
  return PHRASES.find((p) => p.id === id);
}
