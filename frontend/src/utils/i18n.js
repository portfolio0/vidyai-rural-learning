export const t = {
  en: {
    dashboard:'My Dashboard', subjects:'My Subjects', reels:'Learning Reels',
    quiz:'Quizzes', rewards:'Rewards', aiTutor:'AI Tutor', offline:'Offline Mode',
    streak:'Day Streak', xp:'XP Points', continue:'Continue', complete:'Complete',
    upcoming:'Upcoming', askAnything:'Ask me anything...', goodMorning:'Good Morning',
    loading:'Loading...', error:'Something went wrong', retry:'Try Again',
  },
  mr: {
    dashboard:'माझे डॅशबोर्ड', subjects:'माझे विषय', reels:'शैक्षणिक रील्स',
    quiz:'प्रश्नमंजुषा', rewards:'पुरस्कार', aiTutor:'AI शिक्षक', offline:'ऑफलाइन मोड',
    streak:'दिवस सलग', xp:'XP गुण', continue:'पुढे जा', complete:'पूर्ण',
    upcoming:'येणारे', askAnything:'काहीही विचारा...', goodMorning:'शुभ सकाळ',
    loading:'लोड होत आहे...', error:'काहीतरी चुकले', retry:'पुन्हा प्रयत्न करा',
  },
  hi: {
    dashboard:'मेरा डैशबोर्ड', subjects:'मेरे विषय', reels:'लर्निंग रील्स',
    quiz:'प्रश्नोत्तरी', rewards:'पुरस्कार', aiTutor:'AI शिक्षक', offline:'ऑफलाइन मोड',
    streak:'दिन की लड़ी', xp:'XP अंक', continue:'जारी रखें', complete:'पूर्ण',
    upcoming:'आगामी', askAnything:'कुछ भी पूछें...', goodMorning:'शुभ प्रभात',
    loading:'लोड हो रहा है...', error:'कुछ गलत हुआ', retry:'पुनः प्रयास करें',
  },
};

export const translate = (key, lang = 'en') =>
  t[lang]?.[key] ?? t.en[key] ?? key;
