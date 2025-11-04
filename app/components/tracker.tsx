import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTodos } from '../../context/TodoContextProvider';

type WeekTrackerProps = {
  /** 0 = Sunday, 1 = Monday */
  weekStartsOn?: 0 | 1;
};

const toISO = (d: Date) => d.toISOString().slice(0, 10);

const getWeekStart = (today: Date, weekStartsOn: 0 | 1) => {
  const d = new Date(today);
  const dow = d.getDay(); // 0..6 (Sun..Sat)
  const diff = (dow - weekStartsOn + 7) % 7; // days since week start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const WeekTracker: FC<WeekTrackerProps> = ({ weekStartsOn = 0 }) => {
  const { completionHistory, todos } = useTodos();

  const today = new Date();
  const todayISO = toISO(today);

  // Only daily goals are "live" for streak logic
  const liveToday = todos.filter(t => t.frequency === 'daily');
  const allLiveDoneToday =
    liveToday.length > 0 && liveToday.every(t => !!t.completed);

  const startOfWeek = getWeekStart(today, weekStartsOn);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return (
    <View style={styles.container}>
      {days.map(d => {
        const dateISO = toISO(d);

        // Decide status
        let dayStyle = styles.neutralDay;
        let textStyle = styles.neutralText;

        if (dateISO > todayISO) {
          dayStyle = styles.futureDay;
          textStyle = styles.futureText;
        } else if (dateISO < todayISO) {
          const v = completionHistory?.[dateISO];
          if (v === true) {
            dayStyle = styles.completedDay;
            textStyle = styles.completedText;
          } else if (v === false) {
            dayStyle = styles.failedDay;
            textStyle = styles.failedText;
          } else {
            dayStyle = styles.neutralDay; // no record (e.g., no daily goals that day)
            textStyle = styles.neutralText;
          }
        } else {
          // Today: derive from live todos, ignore history
          if (allLiveDoneToday) {
            dayStyle = styles.completedDay;
            textStyle = styles.completedText;
          } else if (liveToday.length > 0) {
            dayStyle = styles.pendingDay; // has dailies, not all done yet
            textStyle = styles.pendingText;
          } else {
            dayStyle = styles.neutralDay; // no daily goals today
            textStyle = styles.neutralText;
          }
        }

        const label = d.toLocaleDateString(undefined, { weekday: 'short' });
        return (
          <View key={dateISO} style={[styles.day, dayStyle]}>
            <Text style={textStyle}>{label[0]}</Text>
          </View>
        );
      })}
    </View>
  );
};

const C_GREEN = '#4CAF50';
const C_RED = '#F44336';
const C_AMBER = '#F59E0B';
const C_BORDER = '#cbd5e1';
const C_TEXT = '#475569';
const C_TEXT_DIM = '#64748b';
const C_FUTURE_BG = '#1f2937';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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

  completedDay: { backgroundColor: C_GREEN, borderColor: C_GREEN },
  completedText: { color: 'white', fontWeight: 'bold' },

  failedDay: { backgroundColor: C_RED, borderColor: C_RED },
  failedText: { color: 'white', fontWeight: 'bold' },

  pendingDay: { backgroundColor: C_AMBER, borderColor: C_AMBER },
  pendingText: { color: '#111827', fontWeight: 'bold' },

  neutralDay: { backgroundColor: 'transparent', borderColor: C_BORDER },
  neutralText: { color: C_TEXT },

  futureDay: {
    backgroundColor: C_FUTURE_BG,
    borderColor: C_BORDER,
    opacity: 0.45,
  },
  futureText: { color: C_TEXT_DIM },
});

export default WeekTracker;
