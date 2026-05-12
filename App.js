import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, ScrollView,
  LayoutAnimation, UIManager 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CONFIGURAZIONE ANIMAZIONI (Necessaria per Android)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = '@terminal_kanban_v3';
const STATUSES = ['BACKLOG', 'DA FARE', 'IN PROGRESS', 'REVIEW', 'DONE'];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => { loadTasks(); }, []);
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) { console.error("FILE_SYSTEM_ERROR:", e); }
  };

  const saveTasks = async (t) => {
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } 
    catch (e) { console.error("WRITE_ERROR:", e); }
  };

  const addTask = () => {
    if (inputText.trim() === '') return;
    // Attiva animazione per l'inserimento
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newTask = {
      id: Date.now().toString(),
      text: inputText.trim().toUpperCase(),
      status: 'BACKLOG',
      createdAt: new Date().toLocaleTimeString('it-IT')
    };
    setTasks([newTask, ...tasks]);
    setInputText('');
  };

  const moveTask = (id, direction) => {
    // Questa è la magia: anima il passaggio tra le colonne stile Trello
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === id) {
        const currentIndex = STATUSES.indexOf(t.status);
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < STATUSES.length) {
          return { ...t, status: STATUSES[nextIndex] };
        }
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const TaskCard = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onLongPress={() => moveTask(item.id, 1)} // Sposta a destra con pressione lunga
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.idText}># {item.id.slice(-4)}</Text>
          <Text style={styles.hintText}>[HOLD_TO_PUSH_RIGHT]</Text>
        </View>
        
        <Text style={styles.taskText}>{`> ${item.text}`}</Text>
        
        <View style={styles.moveButtonsRow}>
          <TouchableOpacity onPress={() => moveTask(item.id, -1)} style={styles.moveBtn}>
            <Text style={styles.moveBtnText}>{"<<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveTask(item.id, 1)} style={styles.moveBtn}>
            <Text style={styles.moveBtnText}>{">>"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteTask(item.id)} style={[styles.moveBtn, {borderColor: '#F85149'}]}>
            <Text style={[styles.moveBtnText, {color: '#F85149'}]}>[X]</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.boardTitle}>To_Do_App</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.boardContent}
      >
        {STATUSES.map(status => (
          <View key={status} style={styles.columnContainer}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>{status}</Text>
              <Text style={styles.countText}>{tasks.filter(t => t.status === status).length}</Text>
            </View>
            
            <FlatList
              data={tasks.filter(t => t.status === status)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TaskCard item={item} />}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={<Text style={styles.emptyMsg}> Lista_Vuota</Text>}
            />
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <Text style={styles.prompt}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome_Task"
            placeholderTextColor="#3E4451"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>Aggiungi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  header: { 
    backgroundColor: '#161B22', 
    paddingTop: Platform.OS === 'android' ? 45 : 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
    alignItems: 'center'
  },
  boardTitle: { fontSize: 16, fontWeight: 'bold', color: '#58A6FF', fontFamily: 'monospace' },
  
  boardContent: { padding: 10, flexDirection: 'row' },
  columnContainer: { 
    width: 290, 
    backgroundColor: '#161B22', 
    borderRadius: 8, 
    marginHorizontal: 10, 
    padding: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    maxHeight: '92%'
  },
  columnHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
    paddingBottom: 8
  },
  columnTitle: { color: '#3fb950', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14 },
  countText: { color: '#8B949E', fontSize: 11, fontFamily: 'monospace' },

  card: { 
    backgroundColor: '#0D1117', 
    borderRadius: 6, 
    marginBottom: 12, 
    borderWidth: 1,
    borderColor: '#30363D',
    padding: 12,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  taskText: { color: '#E6EDF3', fontFamily: 'monospace', fontSize: 14, marginVertical: 10 },
  idText: { color: '#8B949E', fontSize: 10, fontFamily: 'monospace' },
  hintText: { color: '#484F58', fontSize: 8, fontFamily: 'monospace' },
  
  moveButtonsRow: { flexDirection: 'row', marginTop: 5 },
  moveBtn: { 
    borderWidth: 1, 
    borderColor: '#58A6FF', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 4, 
    marginRight: 10 
  },
  moveBtnText: { color: '#58A6FF', fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' },

  inputWrapper: { 
    backgroundColor: '#161B22', 
    borderTopWidth: 1, 
    borderTopColor: '#30363D',
    paddingBottom: Platform.OS === 'ios' ? 35 : 15 
  },
  inputContainer: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  prompt: { color: '#3fb950', fontSize: 20, marginRight: 10, fontFamily: 'monospace', fontWeight: 'bold' },
  input: { 
    flex: 1, height: 45, backgroundColor: '#0D1117', borderWidth: 1, 
    borderColor: '#30363D', borderRadius: 6, paddingHorizontal: 12, 
    color: '#3fb950', fontFamily: 'monospace' 
  },
  addButton: { marginLeft: 10, paddingHorizontal: 15 },
  addButtonText: { color: '#58A6FF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: 14 },
  
  emptyMsg: { color: '#484F58', fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 10 }
});
