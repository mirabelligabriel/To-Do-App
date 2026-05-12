To-Do-App
💻 Terminal Kanban (To-Do App)

Questa è una "Task Management Application" avanzata sviluppata con "React Native" ed "Expo". L'interfaccia si ispira ai terminali di sistema (estetica GitHub Dark) e adotta una struttura a colonne in stile "Trello".

🚀 Caratteristiche Principali

Workflow Dinamico: Gestione delle task in 5 stati: `BACKLOG`, `DA FARE`, `IN PROGRESS`, `REVIEW`, `DONE`.
Visualizzazione Trello: Layout a scorrimento orizzontale per una visione d'insieme di tutte le liste.
Animazioni Fluide: Transizioni animate tramite `LayoutAnimation` per ogni spostamento o eliminazione.
Interazione Smart: Supporto al "Long Press" (pressione prolungata) per spostare rapidamente le task tra le colonne.
Persistenza: Salvataggio automatico dei dati sul dispositivo tramite `AsyncStorage`.

🛠️ Stack Tecnologico

Framework: React Native (Expo)
State Management: React Hooks (`useState`, `useEffect`)
Storage: `@react-native-async-storage/async-storage`
Design: Custom CSS-in-JS (Monospace font, Terminal aesthetic)

🔧 Installazione e Avvio

1. Clona il repository.
2. Installa le dipendenze:
   ```bash
   npm install
