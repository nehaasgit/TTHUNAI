import { Language } from '../../shared/types.js';

export interface LocalizedScheme {
  id: string;
  name: string;
  category: string;
  benefit: string;
  eligibility: string;
  description: string;
  stepsToApply: string[];
}

export const getLocalizedScheme = (scheme: any, lang: Language): LocalizedScheme => {
  const translations: Record<Language, Record<string, LocalizedScheme>> = {
    en: {
      'tn-scheme-1': {
        id: 'tn-scheme-1',
        name: 'Tamil Nadu Manual Workers Welfare Board Registration',
        category: 'Social Security',
        benefit: 'Accidental insurance of ₹1 Lakh, maternity support of ₹6,000, and educational scholarships up to ₹8,000 for children.',
        eligibility: 'All manual/unorganised sector workers aged between 18 and 60 residing in Tamil Nadu.',
        description: 'An official board registration that grants unorganised interstate manual workers social security benefits, educational aid for children, and marriage assistance.',
        stepsToApply: [
          'Fill up Form A (Application Form) in Tamil/English.',
          'Attach copy of Aadhaar Card and Bank Passbook front page.',
          'Obtain employment certificate from a registered trade union or village administrative officer (VAO).',
          'Submit online on the Tamil Nadu Labour Department portal or visit the nearest Labour Facilitation Center.'
        ]
      },
      'tn-scheme-2': {
        id: 'tn-scheme-2',
        name: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
        category: 'Healthcare',
        benefit: 'Cashless medical treatment up to ₹5,000,000 per year per family for over 1,000 procedures.',
        eligibility: 'Families with an annual income below ₹120,000. Extended to migrant workers registered with the Labour Department.',
        description: 'Provides fully-funded health cover for inpatient hospitalisation in public and private empanelled hospitals across Tamil Nadu.',
        stepsToApply: [
          'Get income certificate from Tahsildar / local Revenue Officer.',
          'Take copy of smart ration card and identity proof.',
          'Visit the CMCHIS kiosk at the District Collectorate.',
          'Complete biometric scanning and collect the CMCHIS health card.'
        ]
      },
      'tn-scheme-3': {
        id: 'tn-scheme-3',
        name: 'Piped Water Scheme & Integrated Housing for Migrants',
        category: 'Housing',
        benefit: 'Subsidised shared accommodation with clean drinking water and sanitation facilities near industrial hubs like Kanchipuram and Tiruppur.',
        eligibility: 'Interstate migrant workers employed in registered factories, brick kilns, or textile units in Tamil Nadu.',
        description: 'A special scheme by the Tamil Nadu government to build clean, low-cost transit housing and dormitories for migrant industrial labor.',
        stepsToApply: [
          'Provide proof of active employment in a Tamil Nadu industrial unit.',
          'Submit request form verified by factory HR department.',
          'Receive transit dormitory allotment token.'
        ]
      }
    },
    ta: {
      'tn-scheme-1': {
        id: 'tn-scheme-1',
        name: 'தமிழ்நாடு உடலுழைப்பு தொழிலாளர்கள் நல வாரியப் பதிவு',
        category: 'சமூக பாதுகாப்பு',
        benefit: '₹1 லட்சம் விபத்துக் காப்பீடு, ₹6,000 மகப்பேறு உதவி மற்றும் குழந்தைகளுக்கு ₹8,000 வரை கல்வி உதவித்தொகை.',
        eligibility: 'தமிழ்நாட்டில் வசிக்கும் 18 முதல் 60 வயதுக்குட்பட்ட உடலுழைப்பு/முறையற்ற தொழிலாளர்கள்.',
        description: 'முறையற்ற புலம்பெயர் தொழிலாளர்களுக்கு சமூக பாதுகாப்பு நலன்கள், குழந்தைகளுக்கு கல்வி உதவி மற்றும் திருமண உதவி வழங்கும் அதிகாரப்பூர்வ வாரியப் பதிவு.',
        stepsToApply: [
          'விண்ணப்பப் படிவம் A-வை தமிழ் அல்லது ஆங்கிலத்தில் நிரப்பவும்.',
          'ஆதார் அட்டை மற்றும் வங்கி கணக்கு புத்தகத்தின் முதல் பக்க நகலை இணைக்கவும்.',
          'பதிவு செய்யப்பட்ட தொழிற்சங்கம் அல்லது கிராம நிர்வாக அலுவலரிடம் (VAO) வேலைவாய்ப்புச் சான்றிதழைப் பெறவும்.',
          'தமிழ்நாடு தொழிலாளர் துறை இணையதளத்தில் ஆன்லைனில் சமர்ப்பிக்கவும் அல்லது அருகில் உள்ள தொழிலாளர் வசதி மையத்திற்குச் செல்லவும்.'
        ]
      },
      'tn-scheme-2': {
        id: 'tn-scheme-2',
        name: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS)',
        category: 'சுகாதாரம்',
        benefit: 'ஆண்டுக்கு ஒரு குடும்பத்திற்கு ₹5,00,000 வரை பணமில்லா மருத்துவ சிகிச்சை (1,000 க்கும் மேற்பட்ட நடைமுறைகளுக்கு).',
        eligibility: 'ஆண்டு வருமானம் ₹120,000-க்கு கீழ் உள்ள குடும்பங்கள். தொழிலாளர் துறையில் பதிவு செய்யப்பட்ட புலம்பெயர் தொழிலாளர்களுக்கும் நீட்டிக்கப்பட்டுள்ளது.',
        description: 'தமிழ்நாடு முழுவதும் உள்ள அரசு மற்றும் தனியார் அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் உள்நோயாளி சிகிச்சைக்கு முழு நிதியுதவியுடன் கூடிய மருத்துவக் காப்பீடு வழங்குகிறது.',
        stepsToApply: [
          'வட்டாட்சியர் / உள்ளூர் வருவாய் அலுவலரிடமிருந்து வருமானச் சான்றிதழைப் பெறவும்.',
          'ஸ்மார்ட் ரேஷன் கார்டு மற்றும் அடையாளச் சான்று நகலை எடுக்கவும்.',
          'மாவட்ட ஆட்சியர் அலுவலகத்தில் உள்ள CMCHIS மையத்திற்குச் செல்லவும்.',
          'பயோமெட்ரிக் ஸ்கேனிங்கை முடித்து, CMCHIS மருத்துவ அட்டையைப் பெறவும்.'
        ]
      },
      'tn-scheme-3': {
        id: 'tn-scheme-3',
        name: 'புலம்பெயர்ந்தோருக்கான குழாய் நீர் திட்டம் மற்றும் ஒருங்கிணைந்த வீட்டு வசதி',
        category: 'வீட்டு வசதி',
        benefit: 'காஞ்சிபுரம் மற்றும் திருப்பூர் போன்ற தொழில்துறை மையங்களுக்கு அருகில் சுத்தமான குடிநீர் மற்றும் சுகாதார வசதிகளுடன் கூடிய மானிய விலையிலான பகிர்வு தங்குமிடம்.',
        eligibility: 'தமிழ்நாட்டில் பதிவு செய்யப்பட்ட தொழிற்சாலைகள், செங்கல் சூளைகள் அல்லது ஜவுளி அலகுகளில் பணிபுரியும் பிற மாநில புலம்பெயர் தொழிலாளர்கள்.',
        description: 'புலம்பெயர்ந்த தொழிலாளர்களுக்காக சுத்தமான, குறைந்த செலவில் தங்குமிடங்கள் மற்றும் தங்குமிடங்களை உருவாக்க தமிழ்நாடு அரசின் சிறப்புத் திட்டம்.',
        stepsToApply: [
          'தமிழ்நாடு தொழில்துறை பிரிவில் செயலில் உள்ள வேலைவாய்ப்புக்கான ஆதாரத்தை வழங்கவும்.',
          'தொழிற்சாலை மனிதவளத் துறையால் சரிபார்க்கப்பட்ட கோரிக்கை படிவத்தை சமர்ப்பிக்கவும்.',
          'தற்காலிக தங்குமிட ஒதுக்கீடு அடையாள அட்டையைப் பெறவும்.'
        ]
      }
    },
    hi: {
      'tn-scheme-1': {
        id: 'tn-scheme-1',
        name: 'तमिलनाडु शारीरिक श्रमिक कल्याण बोर्ड पंजीकरण',
        category: 'सामाजिक सुरक्षा',
        benefit: '₹1 लाख का दुर्घटना बीमा, ₹6,000 का मातृत्व सहायता और बच्चों के लिए ₹8,000 तक की शैक्षणिक छात्रवृत्ति।',
        eligibility: 'तमिलनाडु में रहने वाले 18 से 60 वर्ष की आयु के सभी शारीरिक/असंगठित क्षेत्र के श्रमिक।',
        description: 'एक आधिकारिक बोर्ड पंजीकरण जो असंगठित अंतर-राज्यीय शारीरिक श्रमिकों को सामाजिक सुरक्षा लाभ, बच्चों के लिए शैक्षणिक सहायता और विवाह सहायता प्रदान करता है।',
        stepsToApply: [
          'तमिल/अंग्रेजी में फॉर्म ए (आवेदन पत्र) भरें।',
          'आधार कार्ड और बैंक पासबुक के पहले पृष्ठ की प्रति संलग्न करें।',
          'एक पंजीकृत ट्रेड यूनियन या ग्राम प्रशासनिक अधिकारी (VAO) से रोजगार प्रमाण पत्र प्राप्त करें।',
          'तमिलनाडु श्रम विभाग के पोर्टल पर ऑनलाइन जमा करें या निकटतम श्रम सुविधा केंद्र पर जाएं।'
        ]
      },
      'tn-scheme-2': {
        id: 'tn-scheme-2',
        name: 'मुख्यमंत्री व्यापक स्वास्थ्य बीमा योजना (CMCHIS)',
        category: 'स्वास्थ्य सेवा',
        benefit: '1,000 से अधिक प्रक्रियाओं के लिए प्रति परिवार प्रति वर्ष ₹5,00,000 तक का कैशलेस चिकित्सा उपचार।',
        eligibility: '₹120,000 से कम वार्षिक आय वाले परिवार। श्रम विभाग के साथ पंजीकृत प्रवासी श्रमिकों के लिए विस्तारित।',
        description: 'तमिलनाडु भर के सरकारी और निजी मान्यता प्राप्त अस्पतालों में इनपेशेंट अस्पताल में भर्ती के लिए पूरी तरह से वित्त पोषित स्वास्थ्य कवर प्रदान करता है।',
        stepsToApply: [
          'तहसीलदार / स्थानीय राजस्व अधिकारी से आय प्रमाण पत्र प्राप्त करें।',
          'स्मार्ट राशन कार्ड और पहचान प्रमाण की प्रति लें।',
          'जिला कलेक्ट्रेट में CMCHIS कियोस्क पर जाएं।',
          'बायोमेट्रिक स्कैनिंग पूरी करें और CMCHIS स्वास्थ्य कार्ड एकत्र करें।'
        ]
      },
      'tn-scheme-3': {
        id: 'tn-scheme-3',
        name: 'प्रवासियों के लिए पाइप जलापूर्ति योजना और एकीकृत आवास',
        category: 'आवास',
        benefit: 'कांचीपुरम और तिरुपुर जैसे औद्योगिक केंद्रों के पास स्वच्छ पेयजल और स्वच्छता सुविधाओं के साथ सब्सिडी वाले साझा आवास।',
        eligibility: 'तमिलनाडु में पंजीकृत कारखानों, ईंट भट्ठों या कपड़ा इकाइयों में कार्यरत अंतर-राज्यीय प्रवासी श्रमिक।',
        description: 'प्रवासी औद्योगिक श्रमिकों के लिए स्वच्छ, कम लागत वाले पारगमन आवास और डॉर्मिटरी बनाने के लिए तमिलनाडु सरकार की एक विशेष योजना।',
        stepsToApply: [
          'तमिलनाडु औद्योगिक इकाई में सक्रिय रोजगार का प्रमाण प्रदान करें।',
          'फैक्ट्री मानव संसाधन विभाग द्वारा सत्यापित अनुरोध फॉर्म जमा करें।',
          'पारगमन छात्रावास आवंटन टोकन प्राप्त करें।'
        ]
      }
    }
  };

  const setForLang = translations[lang] || translations.en;
  return setForLang[scheme.id] || {
    id: scheme.id,
    name: lang === 'ta' ? scheme.nameTranslated || scheme.name : scheme.name,
    category: scheme.category,
    benefit: scheme.benefit,
    eligibility: scheme.eligibility,
    description: scheme.description,
    stepsToApply: scheme.stepsToApply || []
  };
};
