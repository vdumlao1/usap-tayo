/*
  Usap Tayo — family conversations
  ================================
  Short, realistic dialogues. "You" lines are things you'd say;
  other speakers are family members.

  Fields
  ------
  id          unique, kebab-case (used for saved progress — don't rename)
  title       short scenario name
  setting     one-line description of the situation
  emoji       decorative icon
  note        (optional) a cultural or language tip shown at the end
  keyPhrases  ids from phrases.js that appear in this conversation
  lines       [{ speaker, tagalog, english, pronunciation, verify? }]
              speaker 'You' is styled as your own line.

  Pronunciation guides are approximations (see phrases.js header).
*/

export const CONVERSATIONS = [
  {
    id: 'greeting-lola',
    title: 'Greeting Lola',
    setting: 'You arrive at your grandmother’s house for a visit.',
    emoji: '👵',
    keyPhrases: ['mano-po', 'kumusta-po-kayo', 'mabuti-naman', 'miss-na-kita', 'kumain-ka-na'],
    note:
      'Doing “mano” when you arrive (and leave) is one of the most meaningful gestures you can make with elders. Lola’s reply, “Kaawaan ka ng Diyos,” means “May God have mercy on you” — in practice, “God bless you.”',
    lines: [
      { speaker: 'You', tagalog: 'Mano po, Lola.', english: 'Bless me, Grandma. (taking her hand to your forehead)', pronunciation: 'MAH-noh poh, LOH-lah' },
      {
        speaker: 'Lola',
        tagalog: 'Kaawaan ka ng Diyos. Kumusta ka, apo?',
        english: 'God bless you. How are you, grandchild?',
        pronunciation: 'kah-ah-WAH-ahn kah nahng DYOHS. koo-MOOS-tah kah, AH-poh?',
        verify: 'Stress in “kaawaan” is approximate.',
      },
      { speaker: 'You', tagalog: 'Mabuti naman po. Kayo po, kumusta?', english: 'I’m doing well. And how are you?', pronunciation: 'mah-BOO-tee nah-MAHN poh. kah-YOH poh, koo-MOOS-tah?' },
      {
        speaker: 'Lola',
        tagalog: 'Eto, medyo pagod, pero masaya ako na nandito ka.',
        english: 'Oh, I’m a bit tired, but I’m happy you’re here.',
        pronunciation: 'EH-toh, MED-yoh PAH-gohd, PEH-roh mah-sah-YAH ah-KOH nah nahn-DEE-toh kah',
      },
      { speaker: 'You', tagalog: 'Na-miss ko po kayo.', english: 'I missed you.', pronunciation: 'nah-MISS koh poh kah-YOH' },
      {
        speaker: 'Lola',
        tagalog: 'Na-miss din kita. Kumain ka na ba? May pansit sa kusina.',
        english: 'I missed you too. Have you eaten? There’s pancit in the kitchen.',
        pronunciation: 'nah-MISS din kee-TAH. koo-mah-EEN kah nah bah? my pahn-SEET sah koo-SEE-nah',
      },
    ],
  },
  {
    id: 'how-was-your-day',
    title: 'How was your day?',
    setting: 'You get home from school and Mom asks about your day.',
    emoji: '🎒',
    keyPhrases: ['nandito-na-ako', 'okay-lang', 'pagod-na-ako'],
    note:
      '“Kaya mo ’yan!” (You can do it!) is a phrase you’ll hear a lot from family — and a nice one to say back to them.',
    lines: [
      { speaker: 'You', tagalog: 'Ma, nandito na po ako!', english: 'Mom, I’m home!', pronunciation: 'mah, nahn-DEE-toh nah poh ah-KOH' },
      {
        speaker: 'Nanay',
        tagalog: 'O, anak! Kumusta ang araw mo?',
        english: 'Oh, hi dear! How was your day?',
        pronunciation: 'oh, ah-NAHK! koo-MOOS-tah ahng AH-rahw moh?',
      },
      { speaker: 'You', tagalog: 'Okay lang po. Medyo pagod lang.', english: 'It was okay. Just a little tired.', pronunciation: 'oh-KAY lahng poh. MED-yoh PAH-gohd lahng' },
      { speaker: 'Nanay', tagalog: 'Bakit? Ano’ng nangyari?', english: 'Why? What happened?', pronunciation: 'BAH-kit? ah-NOHNG nahng-YAH-ree?' },
      {
        speaker: 'You',
        tagalog: 'Ang dami pong ginawa sa school. May exam kami bukas.',
        english: 'We had so much work at school. We have an exam tomorrow.',
        pronunciation: 'ahng dah-MEE pohng gee-nah-WAH sah school. my exam kah-MEE boo-KAHS',
      },
      {
        speaker: 'Nanay',
        tagalog: 'Kaya mo ’yan. Magpahinga ka muna, tapos kain tayo.',
        english: 'You can do it. Rest for a bit first, then let’s eat.',
        pronunciation: 'kah-YAH moh yahn. mahg-pah-HEE-ngah kah MOO-nah, TAH-pohs kah-EEN TAH-yoh',
      },
      { speaker: 'You', tagalog: 'Sige po. Salamat, Ma.', english: 'Okay. Thanks, Mom.', pronunciation: 'SEE-geh poh. sah-LAH-maht, mah' },
    ],
  },
  {
    id: 'dinner-table',
    title: 'At the dinner table',
    setting: 'The family sits down to eat together.',
    emoji: '🍲',
    keyPhrases: ['kain-tayo', 'ano-ulam', 'ang-sarap', 'pakiabot', 'kain-ka-pa', 'busog-na-ako'],
    note:
      'Turning down more food can feel tricky. “Busog na po ako” plus a compliment on the cooking is the gracious way to do it.',
    lines: [
      { speaker: 'Tatay', tagalog: 'Kain na tayo! Handa na ang pagkain.', english: 'Let’s eat! The food is ready.', pronunciation: 'kah-EEN nah TAH-yoh! HAHN-dah nah ahng pahg-KAH-in' },
      { speaker: 'You', tagalog: 'Ano po’ng ulam?', english: 'What are we having?', pronunciation: 'ah-NOH pohng oo-LAHM?' },
      { speaker: 'Nanay', tagalog: 'Adobong manok at sinigang na baboy.', english: 'Chicken adobo and pork sinigang.', pronunciation: 'ah-DOH-bohng mah-NOHK aht see-nee-GAHNG nah BAH-boy' },
      {
        speaker: 'You',
        tagalog: 'Ang sarap! Pakiabot po ng kanin.',
        english: 'Delicious! Please pass the rice.',
        pronunciation: 'ahng sah-RAHP! pah-kee-AH-boht poh nahng kah-NEEN',
      },
      { speaker: 'Tatay', tagalog: 'Eto. Kain ka pa, marami pa.', english: 'Here. Have more — there’s plenty.', pronunciation: 'EH-toh. kah-EEN kah pah, mah-RAH-mee pah' },
      {
        speaker: 'You',
        tagalog: 'Busog na po ako. Ang sarap po ng luto n’yo!',
        english: 'I’m full. Your cooking is so good!',
        pronunciation: 'boo-SOHG nah poh ah-KOH. ahng sah-RAHP poh nahng LOO-toh nyoh!',
      },
    ],
  },
  {
    id: 'asking-tito',
    title: 'Asking Tito a question',
    setting: 'You want to learn more about where your family is from.',
    emoji: '🗺️',
    keyPhrases: ['tita-tito', 'talaga'],
    note:
      'Asking elders about their own lives is a wonderful way to practice — and most relatives love being asked. “Puwede po bang magtanong?” (May I ask something?) is a polite opener.',
    lines: [
      {
        speaker: 'You',
        tagalog: 'Tito, puwede po bang magtanong?',
        english: 'Uncle, can I ask you something?',
        pronunciation: 'TEE-toh, PWEH-deh poh bahng mahg-tah-NOHNG?',
      },
      { speaker: 'Tito', tagalog: 'Oo naman. Ano ’yon?', english: 'Of course. What is it?', pronunciation: 'OH-oh nah-MAHN. ah-NOH yohn?' },
      { speaker: 'You', tagalog: 'Saan po kayo lumaki?', english: 'Where did you grow up?', pronunciation: 'sah-AHN poh kah-YOH loo-MAH-kee?' },
      {
        speaker: 'Tito',
        tagalog: 'Sa probinsya, sa Batangas. Doon din lumaki ang lola mo.',
        english: 'In the province, in Batangas. Your grandma grew up there too.',
        pronunciation: 'sah proh-BIN-shah, sah bah-TAHNG-gahs. doh-OHN din loo-MAH-kee ahng LOH-lah moh',
      },
      {
        speaker: 'You',
        tagalog: 'Talaga po? Gusto ko pong pumunta doon balang araw.',
        english: 'Really? I’d love to go there someday.',
        pronunciation: 'tah-LAH-gah poh? GOOS-toh koh pohng poo-MOON-tah doh-OHN BAH-lahng AH-rahw',
      },
      {
        speaker: 'Tito',
        tagalog: 'Sige, isasama ka namin sa susunod na uwi.',
        english: 'Okay, we’ll bring you along next time we go home.',
        pronunciation: 'SEE-geh, ee-sah-SAH-mah kah nah-MEEN sah soo-SOO-nod nah OO-wee',
      },
    ],
  },
  {
    id: 'i-dont-understand',
    title: 'When you don’t understand',
    setting: 'Tita asks you for something using a word you don’t know.',
    emoji: '🤔',
    keyPhrases: ['hindi-ko-maintindihan', 'pasensya-na', 'gets-ko-na', 'ano-ibig-sabihin'],
    note:
      'There’s no shame in asking! Relatives are usually happy to explain. Asking “Ano po ’yung ___?” (What’s ___?) teaches you real household words fast.',
    lines: [
      {
        speaker: 'Tita',
        tagalog: 'Anak, pakikuha nga ’yung sandok sa may lababo.',
        english: 'Dear, could you grab the ladle by the sink?',
        pronunciation: 'ah-NAHK, pah-kee-koo-HAH ngah yoong sahn-DOHK sah my lah-BAH-boh',
        verify: 'Stress in “sandok” and “pakikuha” is approximate.',
      },
      {
        speaker: 'You',
        tagalog: 'Pasensya na po, hindi ko po naintindihan. Ano po ’yung “sandok”?',
        english: 'Sorry, I didn’t understand. What’s a “sandok”?',
        pronunciation: 'pah-SEN-shah nah poh, hin-DEE koh poh nah-in-tin-dee-HAHN. ah-NOH poh yoong sahn-DOHK?',
      },
      {
        speaker: 'Tita',
        tagalog: '’Yung pangsandok ng kanin o sabaw. Ladle!',
        english: 'The thing you use to scoop rice or soup. A ladle!',
        pronunciation: 'yoong pahng-sahn-DOHK nahng kah-NEEN oh sah-BAHW. ladle!',
      },
      { speaker: 'You', tagalog: 'Ah, gets ko na po! Eto po.', english: 'Oh, I get it now! Here you go.', pronunciation: 'ah, GETS koh nah poh! EH-toh poh' },
      { speaker: 'Tita', tagalog: 'Salamat, anak. Ang galing mo na mag-Tagalog!', english: 'Thanks, dear. Your Tagalog is getting good!', pronunciation: 'sah-LAH-maht, ah-NAHK. ahng gah-LEENG moh nah mahg-tah-GAH-log!' },
    ],
  },
  {
    id: 'speak-slowly',
    title: 'Asking Lolo to slow down',
    setting: 'Lolo gives you a message to pass on, but he talks fast.',
    emoji: '🐢',
    keyPhrases: ['pakibagalan', 'pakiulit-po', 'sige'],
    note:
      '“Hindi ko po nakuha lahat” (I didn’t catch all of it) is a gentle way to ask for help without making the speaker feel bad.',
    lines: [
      {
        speaker: 'Lolo',
        tagalog: 'Apo, sabihin mo sa nanay mo, pupunta kami bukas ng hapon pagkatapos ng misa.',
        english: 'Grandchild, tell your mom we’re coming over tomorrow afternoon after Mass.',
        pronunciation: 'AH-poh, sah-bee-HEEN moh sah NAH-nigh moh, poo-POON-tah kah-MEE boo-KAHS nahng HAH-pon pahg-kah-TAH-pohs nahng MEE-sah',
      },
      {
        speaker: 'You',
        tagalog: 'Lolo, pakibagalan lang po. Hindi ko po nakuha lahat.',
        english: 'Lolo, please slow down a little. I didn’t catch all of it.',
        pronunciation: 'LOH-loh, pah-kee-bah-gah-LAHN lahng poh. hin-DEE koh poh nah-koo-HAH lah-HAHT',
      },
      {
        speaker: 'Lolo',
        tagalog: 'Ay, sige. Pupunta… kami… bukas… ng hapon.',
        english: 'Oh, okay. We’re coming… tomorrow… afternoon.',
        pronunciation: 'eye, SEE-geh. poo-POON-tah… kah-MEE… boo-KAHS… nahng HAH-pon',
      },
      { speaker: 'You', tagalog: 'Pagkatapos po ng ano?', english: 'After what?', pronunciation: 'pahg-kah-TAH-pohs poh nahng ah-NOH?' },
      { speaker: 'Lolo', tagalog: 'Ng misa. Pagkatapos magsimba.', english: 'After Mass. After church.', pronunciation: 'nahng MEE-sah. pahg-kah-TAH-pohs mahg-sim-BAH' },
      { speaker: 'You', tagalog: 'Ah, sige po. Sasabihin ko po kay Nanay.', english: 'Okay. I’ll tell Mom.', pronunciation: 'ah, SEE-geh poh. sah-sah-bee-HEEN koh poh kai NAH-nigh' },
    ],
  },
  {
    id: 'weekend-plans',
    title: 'Making weekend plans',
    setting: 'Your cousin texts you about the weekend. (Casual Taglish!)',
    emoji: '📱',
    keyPhrases: ['pinsan', 'sige', 'magre-review'],
    note:
      'Notice how naturally English words mix in: “plano,” “weekend,” “mall,” “text.” With cousins and friends, Taglish is the norm.',
    lines: [
      { speaker: 'Pinsan', tagalog: 'Uy, ano’ng plano mo this weekend?', english: 'Hey, what are your plans this weekend?', pronunciation: 'oy, ah-NOHNG PLAH-noh moh this weekend?' },
      { speaker: 'You', tagalog: 'Wala pa. Ikaw?', english: 'Nothing yet. You?', pronunciation: 'wah-LAH pah. ee-KAHW?' },
      {
        speaker: 'Pinsan',
        tagalog: 'Mag-mall kami nina Ate sa Sabado. Sama ka?',
        english: 'We’re going to the mall with Ate on Saturday. Want to come?',
        pronunciation: 'mahg-MALL kah-MEE nee-NAH AH-teh sah SAH-bah-doh. SAH-mah kah?',
      },
      { speaker: 'You', tagalog: 'Sige! Anong oras?', english: 'Sure! What time?', pronunciation: 'SEE-geh! ah-NOHNG OH-rahs?' },
      { speaker: 'Pinsan', tagalog: 'Mga alas-dos. Susunduin ka namin.', english: 'Around two. We’ll pick you up.', pronunciation: 'mah-NGAH ah-lahs-DOHS. soo-soon-doo-EEN kah nah-MEEN' },
      {
        speaker: 'You',
        tagalog: 'Game! Magre-review muna ako sa umaga. Text mo lang ako.',
        english: 'I’m in! I’ll study in the morning first. Just text me.',
        pronunciation: 'game! mahg-reh-ree-VYOO MOO-nah ah-KOH sah oo-MAH-gah. text moh lahng ah-KOH',
      },
    ],
  },
  {
    id: 'thank-you-mom',
    title: 'Saying “thank you” to Mom',
    setting: 'A quiet moment to tell your mom you appreciate her.',
    emoji: '💐',
    keyPhrases: ['salamat-sa-lahat', 'mahal-kita'],
    note:
      'Many Filipino families show love through actions more than words, so saying it out loud — even simply — can mean a lot.',
    lines: [
      { speaker: 'You', tagalog: 'Ma, salamat po sa lahat.', english: 'Mom, thank you for everything.', pronunciation: 'mah, sah-LAH-maht poh sah lah-HAHT' },
      {
        speaker: 'Nanay',
        tagalog: 'Bakit bigla kang nagpapasalamat?',
        english: 'Why are you suddenly thanking me?',
        pronunciation: 'BAH-kit big-LAH kahng nahg-pah-pah-sah-LAH-maht?',
      },
      {
        speaker: 'You',
        tagalog: 'Wala lang po. Alam ko pong lagi kayong pagod para sa amin.',
        english: 'No reason. I know you’re always tired because of everything you do for us.',
        pronunciation: 'wah-LAH lahng poh. ah-LAHM koh pohng lah-GEE kah-YOHNG PAH-gohd PAH-rah sah ah-MEEN',
      },
      {
        speaker: 'Nanay',
        tagalog: 'Ay, anak. Para sa inyo naman lahat ’to.',
        english: 'Oh, my child. All of this is for you kids anyway.',
        pronunciation: 'eye, ah-NAHK. PAH-rah sah in-YOH nah-MAHN lah-HAHT toh',
      },
      { speaker: 'You', tagalog: 'Mahal na mahal ko po kayo.', english: 'I love you so much.', pronunciation: 'mah-HAHL nah mah-HAHL koh poh kah-YOH' },
      { speaker: 'Nanay', tagalog: 'Mahal din kita, anak.', english: 'I love you too, my child.', pronunciation: 'mah-HAHL din kee-TAH, ah-NAHK' },
    ],
  },
];

export function getConversation(id) {
  return CONVERSATIONS.find((c) => c.id === id);
}
