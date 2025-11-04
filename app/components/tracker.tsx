import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTodos } from '../../context/TodoContextProvider';

type WeekTrackerProps = {};

const WeekTracker: FC<WeekTrackerProps> = () => {
  const { completionHistory, todos } = useTodos();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const todayString = today.toDateString();
  const todayIndex = today.getDay(); // Sun=0, Mon=1, etc.

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - todayIndex);

  const areAllLiveTodosCompleted =
    todos.length > 0 && todos.every(t => t.completed);

  return (
    <View style={styles.container}>
      {days.map((day, index) => {
        const currentDayDate = new Date(startOfWeek);
        currentDayDate.setDate(startOfWeek.getDate() + index);
        const dateString = currentDayDate.toDateString();

        let dayStyle = styles.pendingDay;
        let textStyle = styles.pendingText;

        const historyValue = completionHistory[dateString];

        if (historyValue === true) {
          dayStyle = styles.completedDay;
          textStyle = styles.completedText;
        } else if (historyValue === false) {
          dayStyle = styles.failedDay;
          textStyle = styles.failedText;
        } else if (dateString === todayString && areAllLiveTodosCompleted) {
          dayStyle = styles.completedDay;
          textStyle = styles.completedText;
        }

        return (
          <View key={day} style={[styles.day, dayStyle]}>
            <Text style={textStyle}>{day[0]}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 0,
    marginTop: 25,
    height: 30,
    width: 230,
  },
  day: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  completedDay: {
    backgroundColor: '#4CAF50', // A nice green
    borderColor: '#4CAF50',
  },
  completedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  failedDay: {
    backgroundColor: '#F44336', // A clear red
    borderColor: '#F44336',
  },
  failedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pendingDay: {
    backgroundColor: 'transparent',
    borderColor: '#ccc',
  },
  pendingText: {
    color: '#555',
  },
});

export default WeekTracker;
