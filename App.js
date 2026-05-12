import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@jira_kanban_v2';
const STATUSES = ['Backlog', 'Da Completare', 'In Corso', 'In Revisione', 'Completate'];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentFilter, setCurrentFilter] = useState('Backlog');

  useEffect(() => { loadTasks(); }, []);
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) { console.error(e); }
  };

  const saveTasks = async (t) => {
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } 
    catch (e) { console.error(e); }
  };

  const addTask = () => {
    if (inputText.trim() === '') return;
    const newTask = {
      id: Date.now().toString(),
      text: inputText.trim(),
      status: 'Backlog',
      createdAt: new Date().toLocaleDateString('it-IT')
    };
    setTasks([newTask, ...tasks]);
    setInputText('');
  };

  const moveTask = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter(t => t.status === currentFilter);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.taskText}>{item.text}</Text>
        <Text style={styles.dateText}>REF-{item.id.slice(-4).toUpperCase()} • {item.createdAt}</Text>
        
        <View style={styles.moveButtonsRow}>
          {STATUSES.map((status) => (
            status !== item.status && (
              <TouchableOpacity 
                key={status} 
                onPress={() => moveTask(item.id, status)}
                style={styles.moveBadge}
              >
                <Text style={styles.moveBadgeText}>{status}</Text>
              </TouchableOpacity>
            )
          ))}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => deleteTask(item.id)}
      >
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.boardTitle}>Project Workspace</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusMenu}>
          {STATUSES.map(status => (
            <TouchableOpacity 
              key={status} 
              onPress={() => setCurrentFilter(status)}
              style={[styles.menuItem, currentFilter === status && styles.menuItemActive]}
            >
              <Text style={[styles.menuText, currentFilter === status && styles.menuTextActive]}>
                {status}
              </Text>
              {tasks.filter(t => t.status === status).length > 0 && (
                <View style={[styles.countBadge, currentFilter === status && styles.countBadgeActive]}>
                  <Text style={[styles.countText, currentFilter === status && styles.countTextActive]}>
                    {tasks.filter(t => t.status === status).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyMsg}>Nessun ticket in questa fase</Text>
          </View>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Scrivi un nuovo ticket..."
            placeholderTextColor="#A5ADBA"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFC' },
  
  // Header & Menu
  header: { 
    backgroundColor: '#FFF', 
    paddingTop: Platform.OS === 'android' ? 45 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F4'
  },
  boardTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#091E42', 
    paddingHorizontal: 20, 
    marginBottom: 15,
    letterSpacing: -0.5
  },
  statusMenu: { paddingLeft: 20, marginBottom: 15 },
  menuItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    marginRight: 10, 
    borderRadius: 12, 
    backgroundColor: '#F4F5F7' 
  },
  menuItemActive: { backgroundColor: '#0052CC' },
  menuText: { fontSize: 14, fontWeight: '700', color: '#44546F' },
  menuTextActive: { color: '#FFF' },
  
  countBadge: { marginLeft: 8, backgroundColor: '#DFE1E6', paddingHorizontal: 6, borderRadius: 6 },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  countText: { fontSize: 11, fontWeight: '800', color: '#44546F' },
  countTextActive: { color: '#FFF' },

  // List & Cards
  listPadding: { padding: 20, paddingBottom: 130 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    marginBottom: 16, 
    flexDirection: 'row', 
    borderWidth: 1,
    borderColor: '#F0F1F4',
    shadowColor: '#091E42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  cardContent: { flex: 1, padding: 18 },
  taskText: { fontSize: 17, fontWeight: '600', color: '#172B4D', lineHeight: 22, marginBottom: 4 },
  dateText: { fontSize: 12, color: '#6B778C', fontWeight: '500', marginBottom: 12 },
  
  moveButtonsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  moveBadge: { 
    backgroundColor: '#F0F5FF', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8, 
    marginRight: 6, 
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D2E3FF'
  },
  moveBadgeText: { fontSize: 11, color: '#0052CC', fontWeight: '700' },

  deleteAction: { 
    width: 50, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F4F5F7'
  },
  deleteIcon: { fontSize: 18, color: '#FF5630', fontWeight: 'bold' },

  // Input Area
  inputWrapper: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    borderTopWidth: 1, 
    borderTopColor: '#F0F1F4',
    paddingBottom: Platform.OS === 'ios' ? 35 : 15 
  },
  inputContainer: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  input: { 
    flex: 1, 
    height: 52, 
    backgroundColor: '#FFF', 
    borderWidth: 1.5, 
    borderColor: '#DFE1E6', 
    borderRadius: 14, 
    paddingHorizontal: 18, 
    fontSize: 16,
    color: '#172B4D'
  },
  addButton: { 
    marginLeft: 12, 
    backgroundColor: '#0052CC', 
    paddingHorizontal: 22, 
    height: 52, 
    borderRadius: 14, 
    justifyContent: 'center',
    shadowColor: '#0052CC',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4
  },
  addButtonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyMsg: { fontSize: 15, color: '#6B778C', fontWeight: '500' }
});