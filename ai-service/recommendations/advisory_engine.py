from typing import Dict, Any, List

DISEASE_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "Tomato___Early_Blight": {
        "crop": "Tomato",
        "disease": "Early Blight",
        "scientific_name": "Alternaria solani",
        "severity": "Moderate",
        "en": {
            "symptoms": [
                "Dark brown to black spots with concentric rings ('target board' pattern) on older leaves",
                "Yellowing of tissue surrounding leaf spots",
                "Lower leaves turn brown and drop prematurely"
            ],
            "recommended_action": "Apply copper-based fungicides (e.g. Copper Oxychloride 50 WP @ 2.5g/L) or Mancozeb 75 WP @ 2g/L. Remove and destroy heavily infected lower foliage.",
            "prevention": "Maintain 60cm plant spacing for air circulation. Use drip irrigation instead of overhead sprinklers. Rotate crops with non-solanaceous plants for 2 years."
        },
        "hi": {
            "symptoms": [
                "निचली पत्तियों पर संकेंद्रित छल्लों वाले गहरे भूरे-काले धब्बे",
                "धब्बों के चारों ओर पत्तियों का पीला पड़ना",
                "संक्रमित पत्तियां सूखकर जल्दी गिर जाती हैं"
            ],
            "recommended_action": "कॉपर ऑक्सीक्लोराइड (2.5 ग्राम/लीटर) या मैंकोजेब (2 ग्राम/लीटर) का छिड़काव करें। अत्यधिक संक्रमित पत्तियों को तोड़कर नष्ट करें।",
            "prevention": "पौधों के बीच पर्याप्त दूरी रखें। ड्रिप सिंचाई का उपयोग करें। गैर-सोलानेसी फसलों के साथ फसल चक्र अपनाएं।"
        },
        "mr": {
            "symptoms": [
                "जुन्या पानांवर गोलाकार वलय असलेले तपकिरी-काळे डाग (टार्गेट बोर्ड नक्षी)",
                "डागांभोवती पाने पिवळी पडणे",
                "खालची पाने वाळून अकाली गळणे"
            ],
            "recommended_action": "कॉपर ऑक्सिक्लोराईड (2.5 ग्रॅम/लिटर) किंवा मॅन्कोझेब (2 ग्रॅम/लिटर) ची फवारणी करावी. जास्त प्रादुर्भाव झालेली पाने काढून नष्ट करावीत.",
            "prevention": "रोपांमध्ये योग्य अंतर ठेवावे. ठिबक सिंचनाचा वापर करावा. 2 वर्षे फेरपालट करावी."
        }
    },
    "Tomato___Late_Blight": {
        "crop": "Tomato",
        "disease": "Late Blight",
        "scientific_name": "Phytophthora infestans",
        "severity": "High",
        "en": {
            "symptoms": [
                "Water-soaked irregular pale green lesions turning dark brown rapidly",
                "White fuzzy fungal growth on the underside of leaves in humid mornings",
                "Brown, firm rot developing rapidly on green fruits"
            ],
            "recommended_action": "Immediately spray systemic fungicides such as Metalaxyl-M + Mancozeb (Ridomil MZ @ 2.5g/L) or Cymoxanil + Mancozeb. Avoid working in wet fields.",
            "prevention": "Ensure well-drained field beds. Destroy cull piles and volunteer tomato/potato plants. Select blight-resistant varieties."
        },
        "hi": {
            "symptoms": [
                "पत्तियों पर तेजी से फैलने वाले पानीदार भूरे धब्बे",
                "नम मौसम में पत्तियों के नीचे सफेद फफूंद दिखाई देना",
                "फलों पर कठोर भूरे रंग का सड़न रोग"
            ],
            "recommended_action": "तुरंत मेटालेक्सिल + मैंकोजेब (2.5 ग्राम/लीटर) का छिड़काव करें। गीले खेत में काम करने से बचें।",
            "prevention": "खेत में उचित जल निकासी सुनिश्चित करें। प्रतिरोधी किस्मों का चयन करें।"
        },
        "mr": {
            "symptoms": [
                "पानांवर जलद गतीने पसरणारे काळपट-तपकिरी रंगाचे डाग",
                "दमट हवेत पानांच्या खालच्या बाजूला पांढरी बुरशी दिसणे",
                "फळांवर कडक तपकिरी सड निर्माण होणे"
            ],
            "recommended_action": "तात्काळ मेटॅलॅक्सिल + मॅन्कोझेब (रिडोमिल 2.5 ग्रॅम/लिटर) ची फवारणी करावी. ओल्या शेतात काम करणे टाळावे.",
            "prevention": "पाण्याचा उत्तम निचरा ठेवावा. रोगप्रतिकारक वाणांची निवड करावी."
        }
    },
    "Tomato___Bacterial_Spot": {
        "crop": "Tomato",
        "disease": "Bacterial Spot",
        "scientific_name": "Xanthomonas campestris",
        "severity": "Moderate",
        "en": {
            "symptoms": [
                "Small (2-3mm) dark greasy water-soaked spots on leaves",
                "Leaf margins turn brown and appear scorched",
                "Raised scab-like spots on tomato fruits"
            ],
            "recommended_action": "Spray Copper Hydroxide (2g/L) mixed with Streptocycline (1g in 10L water). Avoid overhead irrigation during sunny hours.",
            "prevention": "Use certified disease-free treated seeds. Avoid handling plants when foliage is wet. Rotate crops for at least 1-2 seasons."
        },
        "hi": {
            "symptoms": [
                "पत्तियों पर छोटे (2-3 मिमी) तैलीय काले धब्बे",
                "पत्तियों के किनारे झुलसे हुए दिखाई देते हैं",
                "फलों पर उभरे हुए खुरदुरे धब्बे"
            ],
            "recommended_action": "कॉपर हाइड्रॉक्साइड (2 ग्राम/लीटर) + स्ट्रेप्टोसाइक्लिन (1 ग्राम प्रति 10 लीटर पानी) का छिड़काव करें।",
            "prevention": "प्रमाणित रोगमुक्त बीजों का उपयोग करें। गीली पत्तियों को न छुएं।"
        },
        "mr": {
            "symptoms": [
                "पानांवर लहान (2-3 मिमी) काळपट तेलकट डाग",
                "पानांच्या कडा करपल्यासारख्या दिसणे",
                "फळांवर खडबडीत फोडांसारखे डाग"
            ],
            "recommended_action": "कॉपर हायड्रॉक्साईड (2 ग्रॅम/लिटर) सोबत स्ट्रेप्टोसायक्लिन (1 ग्रॅम प्रति 10 लिटर पाणी) फवारावे.",
            "prevention": "प्रमाणित बियाण्यांचा वापर करावा. पाने ओली असताना शेतीची कामे टाळावीत."
        }
    },
    "Tomato___Healthy": {
        "crop": "Tomato",
        "disease": "Healthy Plant",
        "scientific_name": "Solanum lycopersicum",
        "severity": "Healthy",
        "en": {
            "symptoms": ["No visible disease symptoms detected. Leaves are vibrant green and vigorous."],
            "recommended_action": "Continue routine nutrient management and balanced irrigation. Monitor weekly for pest arrivals.",
            "prevention": "Maintain clean weeding, optimal spacing, and balanced NPK fertilization."
        },
        "hi": {
            "symptoms": ["कोई रोग लक्षण नहीं मिला। पत्तियां स्वस्थ और हरी हैं।"],
            "recommended_action": "संतुलित पोषण और सिंचाई जारी रखें। साप्ताहिक रूप से कीटों की निगरानी करें।",
            "prevention": "खेत को खरपतवार मुक्त रखें और संतुलित उर्वरक दें।"
        },
        "mr": {
            "symptoms": ["पिकावर कोणत्याही रोगाची लक्षणे आढळली नाहीत. पाने निरोगी व हिरवीगार आहेत."],
            "recommended_action": "संतुलित खत आणि नियमित पाणी व्यवस्थापन सुरू ठेवावे. किडींचे नियमित निरीक्षण करावे.",
            "prevention": "तणमुक्त शेत आणि संतुलित खतांचा वापर सुरू ठेवावा."
        }
    },
    "Potato___Early_Blight": {
        "crop": "Potato",
        "disease": "Early Blight",
        "scientific_name": "Alternaria solani",
        "severity": "Moderate",
        "en": {
            "symptoms": [
                "Concentric brown-black circular lesions on lower potato foliage",
                "Premature leaf drop leading to reduced tuber bulking"
            ],
            "recommended_action": "Apply protective sprays of Mancozeb 75 WP @ 2g/L or Chlorothalonil 75 WP @ 2g/L.",
            "prevention": "Use certified seed tubers. Ensure balanced potash fertilization to increase tuber resistance."
        },
        "hi": {
            "symptoms": ["आलू की निचली पत्तियों पर संकेंद्रित छल्लेदार भूरे-काले धब्बे"],
            "recommended_action": "मैंकोजेब (2 ग्राम/लीटर) या क्लोरोथैलोनिल (2 ग्राम/लीटर) का छिड़काव करें।",
            "prevention": "प्रमाणित बीज कंदों का उपयोग करें। पोटाश उर्वरक का संतुलित उपयोग करें।"
        },
        "mr": {
            "symptoms": ["बटाट्याच्या खालच्या पानांवर गोलाकार तपकिरी-काळे डाग"],
            "recommended_action": "मॅन्कोझेब 75 WP (2 ग्रॅम/लिटर) ची फवारणी करावी.",
            "prevention": "प्रमाणित बियाणे वापरावे. पोटॅश खताचा संतुलित वापर करावा."
        }
    },
    "Potato___Late_Blight": {
        "crop": "Potato",
        "disease": "Late Blight",
        "scientific_name": "Phytophthora infestans",
        "severity": "High",
        "en": {
            "symptoms": [
                "Water-soaked dark lesions spreading rapidly across foliage",
                "Brown dry rot beneath tuber skin in storage"
            ],
            "recommended_action": "Spray Metalaxyl + Mancozeb (2.5g/L) or Dimethomorph (1g/L) immediately upon noticing first lesions.",
            "prevention": "Ensure good earthing-up to prevent tuber infection from sporangia washed into soil."
        },
        "hi": {
            "symptoms": ["पत्तियों पर तेजी से फैलने वाले काले-भूरे धब्बे और कंदों में सड़न"],
            "recommended_action": "मेटालेक्सिल + मैंकोजेब (2.5 ग्राम/लीटर) का तुरंत छिड़काव करें।",
            "prevention": "मिट्टी चढ़ाने का कार्य ठीक से करें ताकि कंद रोग से सुरक्षित रहें।"
        },
        "mr": {
            "symptoms": ["पानांवर वेगाने पसरणारे काळपट डाग आणि बटाट्यात सड निर्माण होणे"],
            "recommended_action": "मेटॅलॅक्सिल + मॅन्कोझेब (2.5 ग्रॅम/लिटर) ची तात्काळ फवारणी करावी.",
            "prevention": "बटाट्याला योग्य भर द्यावी जेणेकरून कंद सुरक्षित राहतील."
        }
    },
    "Potato___Healthy": {
        "crop": "Potato",
        "disease": "Healthy Plant",
        "scientific_name": "Solanum tuberosum",
        "severity": "Healthy",
        "en": {
            "symptoms": ["Potato leaves are healthy with no blight or necrotic lesions."],
            "recommended_action": "Maintain optimal earthing-up and regular scouting for aphid vectors.",
            "prevention": "Ensure uniform soil moisture during tuber initiation."
        },
        "hi": {
            "symptoms": ["आलू की पत्तियां पूरी तरह स्वस्थ हैं।"],
            "recommended_action": "नियमित मिट्टी चढ़ाना और एफिड कीटों की निगरानी जारी रखें।",
            "prevention": "कंद निर्माण के दौरान पर्याप्त नमी बनाए रखें।"
        },
        "mr": {
            "symptoms": ["बटाट्याची पाने पूर्णपणे निरोगी आहेत."],
            "recommended_action": "मातीची भर आणि मावा किडीचे निरीक्षण नियमित ठेवावे.",
            "prevention": "कंद पोसण्याच्या काळात नियमित ओल ठेवावी."
        }
    },
    "Corn___Common_Rust": {
        "crop": "Corn (Maize)",
        "disease": "Common Rust",
        "scientific_name": "Puccinia sorghi",
        "severity": "Moderate",
        "en": {
            "symptoms": [
                "Golden brown to cinnamon-brown pustules scattered across both leaf surfaces",
                "Pustules erupt releasing powdery reddish-brown spores"
            ],
            "recommended_action": "Apply Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L or Mancozeb @ 2.5g/L if rust pustules appear before silking stage.",
            "prevention": "Plant rust-tolerant hybrid corn varieties. Avoid late planting in cool humid seasons."
        },
        "hi": {
            "symptoms": ["मक्का की पत्तियों पर दालचीनी जैसे भूरे रंग के उभरे हुए फफोले"],
            "recommended_action": "एजोक्सीस्ट्रोबिन + डाइफेनोकोनाजोल (1 मिली/लीटर) या मैंकोजेब का छिड़काव करें।",
            "prevention": "रोग प्रतिरोधी संकर किस्मों का चयन करें।"
        },
        "mr": {
            "symptoms": ["मक्याच्या पानांच्या दोन्ही बाजूंवर तांबूस-तपकिरी रंगाचे फोड"],
            "recommended_action": "मॅन्कोझेब (2.5 ग्रॅम/लिटर) ची फवारणी करावी.",
            "prevention": "रोगप्रतिकारक संकरित वाणांची लागवड करावी."
        }
    },
    "Corn___Healthy": {
        "crop": "Corn (Maize)",
        "disease": "Healthy Plant",
        "scientific_name": "Zea mays",
        "severity": "Healthy",
        "en": {
            "symptoms": ["Maize foliage is vigorous, dark green, and free from fungal pustules."],
            "recommended_action": "Apply top-dressing nitrogen at knee-high and tasseling stages.",
            "prevention": "Ensure stem borer and fall armyworm pheromone monitoring."
        },
        "hi": {
            "symptoms": ["मक्के का पौधा पूरी तरह स्वस्थ है।"],
            "recommended_action": "घुटने की ऊंचाई और मंजरी निकलने की अवस्था में नाइट्रोजन दें।",
            "prevention": "फॉल आर्मीवॉर्म कीट की नियमित निगरानी करें।"
        },
        "mr": {
            "symptoms": ["मक्याचे पीक निरोगी आणि जोमदार आहे."],
            "recommended_action": "गुडघाभर उंचीच्या व तुरा येण्याच्या अवस्थेत नत्र खत द्यावे.",
            "prevention": "लष्करी अळीच्या नियंत्रणासाठी कामगंध सापळे वापरावेत."
        }
    }
}


def get_disease_recommendations(class_name: str, language: str = "en") -> Dict[str, Any]:
    """
    Returns agronomic details, symptoms, recommended actions, and prevention in requested language.
    Supported languages: 'en' (English), 'hi' (Hindi), 'mr' (Marathi).
    """
    lang = language.lower() if language else "en"
    if lang not in {"en", "hi", "mr"}:
        lang = "en"

    entry = DISEASE_KNOWLEDGE_BASE.get(class_name)
    if not entry:
        # Generic fallback for unlisted class
        clean_name = class_name.replace("___", " - ").replace("_", " ")
        return {
            "crop": clean_name.split(" - ")[0] if " - " in clean_name else "Crop",
            "disease": clean_name.split(" - ")[1] if " - " in clean_name else clean_name,
            "severity": "Moderate",
            "symptoms": ["Visual leaf spots or abnormal foliage discoloration detected."],
            "recommended_action": "Consult your nearest Krishi Vigyan Kendra (KVK) or local agricultural officer for site-specific treatment.",
            "prevention": "Avoid waterlogging and practice crop hygiene."
        }

    lang_data = entry.get(lang, entry["en"])
    return {
        "crop": entry["crop"],
        "disease": entry["disease"],
        "scientific_name": entry.get("scientific_name", ""),
        "severity": entry["severity"],
        "symptoms": lang_data["symptoms"],
        "recommended_action": lang_data["recommended_action"],
        "prevention": lang_data["prevention"]
    }
