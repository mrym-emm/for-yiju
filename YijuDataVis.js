import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Tooltip } from 'react-tooltip';

// all css used for the dashboard components, grouped by purpose
const styles = {
    // container styles for overall dashboard layout
    // we're centering the whole dashboard and setting a max width for better readability
    container: {
      padding: '2rem',
      fontFamily: 'monospace',
      maxWidth: '1200px',
      margin: '0 auto', 
    },
    // this creates a flexible card container that wraps cards when screen gets smaller
    // the gap creates consistent spacing between the cards
    cardContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '2rem',
      justifyContent: 'center', // makes cards centered instead of left-aligned
    },
    // individual stat card styling with soft shadows and rounded corners
    // flex property ensures cards grow and shrink properly
    card: {
      flex: '1 0 200px',
      background: '#f1f1f1',
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    // emoji serves as visual indicator for each stat
    cardEmoji: {
      fontSize: '2rem',
      marginBottom: '0.5rem',
    },
    // card title styling for consistent typography
    cardTitle: {
      margin: '0.5rem 0',
      fontWeight: 'bold',
    },
    // makes the actual numbers stand out with color and size
    cardValue: {
      fontSize: '1.8rem',
      color: '#2e7d32',
    },
    // separate section for the heatmap with proper spacing
    heatmapSection: {
      marginTop: '3rem',
    },
    // centers the heatmap title and adds consistent spacing
    heatmapTitle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      marginTop: '2rem',
      color: '#666',
    },
    // styles for custom heatmap layout
    customHeatmap: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      marginTop: '1rem',
    },
    // container for both rows of months
    heatmapRows: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      alignItems: 'center', // centers both rows horizontally
    },
    // styles for each individual month row
    heatmapRow: {
      display: 'flex',
      gap: '2rem',
      justifyContent: 'center', // evenly spaces months in each row
    },
    // container for each month's label and weeks
    monthContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    // month label styling (Jan, Feb, etc.)
    monthLabel: {
      fontWeight: 'bold',
      color: '#666',
      marginBottom: '0.5rem',
    },
    // container for the week squares in each month
    weeksContainer: {
      display: 'flex',
      gap: '0.3rem',
    },
    // base styling for each week square
    weekBox: {
      width: '2rem',
      height: '2rem',
      borderRadius: '4px',
      background: '#ebedf0',
      cursor: 'pointer',
      transition: 'transform 0.1s ease',
    },
    // styling for week number labels (W1, W2, etc.)
    weekLabel: {
      fontSize: '0.7rem',
      textAlign: 'center',
      color: '#666',
      marginTop: '0.2rem',
    },
    // color for empty weeks (no attacks)
    emptyWeek: {
      background: '#ebedf0',
    },
    // color gradient for attack intensity
    // using shades of red for attack heatmap (few to many attacks)
    level1: {
      background: '#fddad7', // lightest red - fewest attacks
    },
    level2: {
      background: '#fbb6af', // light red
    },
    level3: {
      background: '#fa9286', // medium red
    },
    level4: {
      background: '#f86d5e', // darkest red - most attacks
    },
};

// connecting to our database using supabase
// supabase gives us an easy api to fetch and store data

const supabaseUrl = "https://ektqafpmakngeshistpk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrdHFhZnBtYWtuZ2VzaGlzdHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDg2NTMxNCwiZXhwIjoyMDYwNDQxMzE0fQ.YhCIciKYk6_oOvSYPSmXeKj9MMwMXM7Wq9ricgbrADE";
const supabase = createClient(supabaseUrl, supabaseKey);

// reusable component for displaying statistics in a card format
// takes emoji icon, label text, and count value as props
const StatCard = ({ emoji, label, count }) => {
  let iconElement;
  
  // select the appropriate emoji based on which statistic showing
  // this makes the cards more visually distinct and intuitive
  switch(label) {
    case "Victims":
      iconElement = <div style={styles.cardEmoji}>🎯</div>;
      break;
    case "This Month":
      iconElement = <div style={styles.cardEmoji}>📅</div>;
      break;
    case "This Year":
      iconElement = <div style={styles.cardEmoji}>🗓️</div>;
      break;
    default:
      iconElement = <div style={styles.cardEmoji}>{emoji}</div>;
  }
  
  return (
    <div style={styles.card}>
      {iconElement}
      <h3 style={styles.cardTitle}>{label}</h3>
      <p style={styles.cardValue}>{count}</p>
    </div>
  );
};

// calculates which week of the month a date belongs to
// needed for properly grouping attacks by week in our heatmap
const getWeekOfMonth = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

// formats a date into our "Jan W1" format for week labels
// this makes the heatmap easy to read with abbreviated month + week number
const formatMonthWeek = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const weekNum = getWeekOfMonth(date);
  return `${month} W${weekNum}`;
};

// generates an array of all weeks in the specified year
// this creates the structure for our heatmap and ensures we don't miss any weeks
const getAllWeeksInYear = (year) => {
  const weeks = [];
  const currentDate = new Date(year, 0, 1); // start with january 1st
  
  // adjust to start on the first sunday of the year (or last sunday of previous year)
  // this ensures we have complete weeks in our data
  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // loop through the entire year, creating week objects
  while (currentDate.getFullYear() <= year) {
    const weekStart = new Date(currentDate);
    const weekMiddle = new Date(currentDate);
    weekMiddle.setDate(weekMiddle.getDate() + 3); // use wednesday for labeling the week
    
    // move to end of current week (saturday)
    currentDate.setDate(currentDate.getDate() + 6);
    const weekEnd = new Date(currentDate);
    
    // only include weeks that overlap with our target year
    if (weekEnd.getFullYear() >= year && weekStart.getFullYear() <= year) {
      weeks.push({
        start: new Date(weekStart),
        end: new Date(weekEnd),
        label: formatMonthWeek(weekMiddle),
        month: weekMiddle.getMonth(),
        weekOfMonth: getWeekOfMonth(weekMiddle)
      });
    }
    
    // move to next week (sunday)
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return weeks;
};

// main dashboard component that fetches and displays ransomware data
const YijuDataVis = () => {
  // state for storing our data and controlling component behavior
  const [ransomData, setRansomData] = useState([]); // all ransomware attacks
  const [heatmapByMonth, setHeatmapByMonth] = useState({}); // processed data for heatmap
  const [isLoading, setIsLoading] = useState(true); // loading state for better ux

  // fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      // get all ransomware data from our database, ordered by date
      const { data, error } = await supabase
        .from('asean_ransomware')
        .select('*')
        .order('published', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
      } else {
        console.log("Fetched from Supabase:", data.length, "entries");
        setRansomData(data);
        processWeeklyData(data); // process raw data into weekly format for heatmap
      }
    };

    fetchData();
  }, []);

  // transforms raw attack data into week-by-week format for the heatmap
  const processWeeklyData = (data) => {
    const year = new Date().getFullYear();
    const allWeeks = getAllWeeksInYear(year);
    
    // initialize a map to count attacks by week
    const weeklyMap = {};
    allWeeks.forEach(week => {
      weeklyMap[week.label] = 0; // start with zero attacks for each week
    });
    
    // count attacks for each week
    data.forEach(item => {
      const date = new Date(item.published);
      if (date.getFullYear() === year) {
        const weekLabel = formatMonthWeek(date);
        if (weeklyMap[weekLabel] !== undefined) {
          weeklyMap[weekLabel] += 1; // increment attack count for this week
        }
      }
    });
    
    // organize weeks by month for display in the heatmap
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsMap = {};
    
    months.forEach(month => {
      monthsMap[month] = [];
      // find all weeks for this specific month
      const monthWeeks = allWeeks.filter(week => week.label.startsWith(month));
      // sort by week number for correct order
      monthWeeks.sort((a, b) => a.weekOfMonth - b.weekOfMonth);
      
      // create objects for each week with attack counts and labels
      monthWeeks.forEach(week => {
        const count = weeklyMap[week.label] || 0;
        monthsMap[month].push({
          label: `W${week.weekOfMonth}`,
          count,
          fullLabel: week.label,
          dates: `${week.start.toLocaleDateString()} - ${week.end.toLocaleDateString()}`
        });
      });
      
      // ensure exactly 4 weeks for each month for consistent display
      if (monthsMap[month].length > 4) {
        // if more than 4 weeks, keep only the first 4
        monthsMap[month] = monthsMap[month].slice(0, 4);
      } else {
        // if fewer than 4 weeks, add placeholder weeks
        while (monthsMap[month].length < 4) {
          const weekNumber = monthsMap[month].length + 1;
          monthsMap[month].push({
            label: `W${weekNumber}`,
            count: 0,
            fullLabel: `${month} W${weekNumber}`,
            dates: 'No data',
            placeholder: true
          });
        }
      }
    });
    
    setHeatmapByMonth(monthsMap);
    setIsLoading(false); // data is ready, stop showing loading state
  };

  // calculate the number of attacks in the current month
  const getThisMonthCount = (data) => {
    const now = new Date();
    return data.filter(item => {
      const date = new Date(item.published);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  };

  // calculate the number of attacks in the current year
  const getThisYearCount = (data) => {
    const year = new Date().getFullYear();
    return data.filter(item => new Date(item.published).getFullYear() === year).length;
  };

  // determine which color to use based on attack count
  // more attacks = darker color on the heat scale
  const getColorClass = (count) => {
    if (count === 0) return styles.emptyWeek;
    if (count > 10) return styles.level4; // highest intensity - many attacks
    if (count > 5) return styles.level3;  // high
    if (count > 2) return styles.level2;  // medium
    return styles.level1; // lowest intensity - few attacks
  };

  // creates the tworow horizontal heatmap layout
  // this makes the visualization more compact and easier to scan
  const renderHorizontalHeatmap = () => {
    const months = Object.keys(heatmapByMonth);
    const firstRow = months.slice(0, 6); // jan to jun
    const secondRow = months.slice(6, 12); // jul to dec
    
    return (
      <div style={styles.heatmapRows}>
        <div style={styles.heatmapRow}>
          {firstRow.map(month => (
            <div key={month} style={styles.monthContainer}>
              <div style={styles.monthLabel}>{month}</div>
              <div style={styles.weeksContainer}>
                {heatmapByMonth[month].map((week, index) => (
                  <div key={index}>
                    <div 
                      style={{...styles.weekBox, ...getColorClass(week.count)}}
                      data-tooltip-id="heatmap-tooltip"
                      data-tooltip-content={`${week.fullLabel}: ${week.count} attacks`}
                    ></div>
                    <div style={styles.weekLabel}>{week.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={styles.heatmapRow}>
          {secondRow.map(month => (
            <div key={month} style={styles.monthContainer}>
              <div style={styles.monthLabel}>{month}</div>
              <div style={styles.weeksContainer}>
                {heatmapByMonth[month].map((week, index) => (
                  <div key={index}>
                    <div 
                      style={{...styles.weekBox, ...getColorClass(week.count)}}
                      data-tooltip-id="heatmap-tooltip"
                      data-tooltip-content={`${week.fullLabel}: ${week.count} attacks`}
                    ></div>
                    <div style={styles.weekLabel}>{week.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // render the full dashboard
  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center' }}>
        <span style={{ marginRight: '10px' }}>🦠</span>
        ASEAN Ransomware Dashboard
      </h2>

      <div style={styles.cardContainer}>
        <StatCard emoji="🎯" label="Victims (Since 2020)" count={ransomData.length} />
        <StatCard emoji="📅" label="This Month" count={getThisMonthCount(ransomData)} />
        <StatCard emoji="🗓️" label="This Year" count={getThisYearCount(ransomData)} />
      </div>

      <div style={styles.heatmapSection}>
        <div style={styles.heatmapTitle}>
          <h3>📆 Weekly Attack Heatmap</h3>
        </div>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading heatmap data...</div>
        ) : (
          <div>
            {renderHorizontalHeatmap()}
            <Tooltip id="heatmap-tooltip" />
          </div>
        )}
      </div>
    </div>
  );
};

export default YijuDataVis;