import { useEffect, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';

export default function App() {
  const [u, setU] = useState(''); 
  const [i, setI] = useState(''); 
  const [r, setR] = useState(''); 
  const [p, setP] = useState(''); 
  
  const [status, setStatus] = useState('Введіть будь-які два значення');
  const [lastChanged, setLastChanged] = useState([]); 
  const [calculatedFields, setCalculatedFields] = useState([]); 

  const formatNum = (num) => {
    if (isNaN(num) || !isFinite(num) || num === 0) return '';
    const formatted = parseFloat(num.toFixed(4));
    return formatted.toString();
  };

  useEffect(() => {
    const uVal = parseFloat(u);
    const iVal = parseFloat(i);
    const rVal = parseFloat(r);
    const pVal = parseFloat(p);

    const fields = [
      { id: 'u', val: u },
      { id: 'i', val: i },
      { id: 'r', val: r },
      { id: 'p', val: p }
    ];

    const filledFields = fields.filter(f => f.val !== '' && !isNaN(parseFloat(f.val)));

    if (filledFields.length <= 1) {
      setCalculatedFields([]);
      if (filledFields.length === 0) {
        setU(''); setI(''); setR(''); setP('');
        setStatus('Введіть значення');
      } else {
        const activeId = lastChanged[lastChanged.length - 1];
        if (activeId !== 'u' && calculatedFields.includes('u')) setU('');
        if (activeId !== 'i' && calculatedFields.includes('i')) setI('');
        if (activeId !== 'r' && calculatedFields.includes('r')) setR('');
        if (activeId !== 'p' && calculatedFields.includes('p')) setP('');
        setStatus('Введіть друге значення');
      }
      return;
    }

    const [id1, id2] = lastChanged.slice(-2);
    let resU = uVal, resI = iVal, resR = rVal, resP = pVal;
    let newCalculated = [];

    try {
      if (id1 === 'u' && id2 === 'i' || id1 === 'i' && id2 === 'u') {
        resR = uVal / iVal;
        resP = uVal * iVal;
        newCalculated = ['r', 'p'];
      }
      else if (id1 === 'u' && id2 === 'r' || id1 === 'r' && id2 === 'u') {
        resI = uVal / rVal;
        resP = (uVal * uVal) / rVal;
        newCalculated = ['i', 'p'];
      }
      else if (id1 === 'i' && id2 === 'r' || id1 === 'r' && id2 === 'i') {
        resU = iVal * rVal;
        resP = iVal * iVal * rVal;
        newCalculated = ['u', 'p'];
      }
      else if (id1 === 'p' && id2 === 'u' || id1 === 'u' && id2 === 'p') {
        resI = pVal / uVal;
        resR = (uVal * uVal) / pVal;
        newCalculated = ['i', 'r'];
      }
      else if (id1 === 'p' && id2 === 'i' || id1 === 'i' && id2 === 'p') {
        resU = pVal / iVal;
        resR = pVal / (iVal * iVal);
        newCalculated = ['u', 'r'];
      }
      else if (id1 === 'p' && id2 === 'r' || id1 === 'r' && id2 === 'p') {
        resU = Math.sqrt(pVal * rVal);
        resI = Math.sqrt(pVal / rVal);
        newCalculated = ['u', 'i'];
      }

      if (newCalculated.includes('u')) setU(formatNum(resU));
      if (newCalculated.includes('i')) setI(formatNum(resI));
      if (newCalculated.includes('r')) setR(formatNum(resR));
      if (newCalculated.includes('p')) setP(formatNum(resP));
      
      setCalculatedFields(newCalculated);
      setStatus('Розраховано автоматично');

    } catch (e) {
      setStatus('Помилка розрахунку');
    }
  }, [u, i, r, p, lastChanged]);

  const handleInputChange = (id, value) => {
    const cleanValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    
    if (id === 'u') setU(cleanValue);
    if (id === 'i') setI(cleanValue);
    if (id === 'r') setR(cleanValue);
    if (id === 'p') setP(cleanValue);

    if (cleanValue !== '') {
      setLastChanged(prev => {
        const filtered = prev.filter(item => item !== id);
        return [...filtered, id];
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inner}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Калькулятор</Text>

            <View style={styles.card}>
              <InputGroup 
                label="Напруга (U, Вольти)" 
                value={u} 
                onChangeText={(v) => handleInputChange('u', v)}
                isCalculated={calculatedFields.includes('u')}
                color="#BB86FC"
              />
              <InputGroup 
                label="Струм (I, Ампери)" 
                value={i} 
                onChangeText={(v) => handleInputChange('i', v)}
                isCalculated={calculatedFields.includes('i')}
                color="#BB86FC"
              />
              <InputGroup 
                label="Опір (R, Оми)" 
                value={r} 
                onChangeText={(v) => handleInputChange('r', v)}
                isCalculated={calculatedFields.includes('r')}
                color="#BB86FC"
              />
              <InputGroup 
                label="Потужність (P, Вати)" 
                value={p} 
                onChangeText={(v) => handleInputChange('p', v)}
                isCalculated={calculatedFields.includes('p')}
                color="#03DAC6" // Виділяємо потужність іншим кольором
              />

              <Text style={styles.status}>{status}</Text>
            </View>
            
            <Text style={styles.footer}>Заповніть будь-які 2 поля</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const InputGroup = ({ label, value, onChangeText, isCalculated, color }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[
        styles.input, 
        isCalculated && { color: color, fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }
      ]}
      value={value}
      onChangeText={onChangeText}
      keyboardType="decimal-pad"
      placeholder="0.0"
      placeholderTextColor="#444"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '200',
    color: '#BB86FC',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 28,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    color: '#777',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#262626',
    borderRadius: 15,
    padding: 16,
    color: '#FFF',
    fontSize: 22,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  status: {
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  }
});