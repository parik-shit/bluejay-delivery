// pages/index.js
"use client";
import React, { useState } from "react";
import FileDropZone from "./FileDropZone";
import * as XLSX from "xlsx";

const Logic = () => {
  const [results, setResults] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  // Error Handling - if the format of the dropped file is not .xlsx than render an error/flag to the user
  const [fileError, setFileError] = useState('');


  const analyzeFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Assuming the data is in the first sheet of the workbook
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Using XLSX.utils.sheet_to_json to convert the sheet data into an array of objects
      const sheetData = XLSX.utils.sheet_to_json(sheet);

      // Your analysis logic goes here
      const filteredResults = sheetData.filter((employee, index, array) => {
        // logic for (a) 7 consecutive days
        const consecutiveDays = 7;
        const dateColumn = "Pay Cycle Start Date";

        const consecutiveDaysCheck = array
          .slice(index, index + consecutiveDays)
          .every((emp, i) => {
            if (i === 0) return true;
            const currentDate = new Date(emp[dateColumn]);
            const previousDate = new Date(array[index + i - 1][dateColumn]);
            return (currentDate - previousDate) / (1000 * 60 * 60 * 24) === 1;
          });

        // logic for (b) less than 10 hours between shifts but greater than 1 hour
        const timeColumn = "Time";
        const timeOutColumn = "Time Out";

        const timeBetweenShiftsCheck =
          index + 1 < array.length && new Date(array[index + 1][timeColumn]) - new Date(employee[timeOutColumn]) > 1 * 60 * 60 * 1000 && new Date(array[index + 1][timeColumn]) - new Date(employee[timeOutColumn]) < 10 * 60 * 60 * 1000;

        // Example logic for (c) worked for more than 14 hours in a single shift
        const timecardHoursColumn = "Timecard Hours (as Time)";
        const singleShiftHoursCheck =
          parseFloat(employee[timecardHoursColumn]) > 14;

        return (
          consecutiveDaysCheck || timeBetweenShiftsCheck || singleShiftHoursCheck
        );
      });

      setResults(filteredResults);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (file) => {
    if (file.name.endsWith('.xlsx')) {
        setFileError('');
        analyzeFile(file);
      } else {
        setFileError('Invalid file format. Please upload an .xlsx file.');
      }
  };
{fileError && <p style={{ color: 'red' }}>{fileError}</p>}
  const handleSubmit = () => {
    setIsButtonClicked(true);
    // Log the names and positions of employees 
    results.forEach((employee) => {
        // Check, if all the fields are non-empty
      if (
        employee["Time Out"] != "" && employee["Position Status"] != "" && employee["File Number"] != ""
      ) {
        console.log(
          `Name: ${employee["Employee Name"]}, Position: ${employee["Position ID"]}`
        );
      }
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white ">
      <div className="border-2 p-3 rounded-md align-center">
        <h1 className="text-3xl font-bold py-5">Employee Analysis</h1>
        <FileDropZone onFileSelect={handleFileSelect} />
        <div className="py-3 ">
          <button
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            onClick={handleSubmit}
          >
            Submit
          </button>
          {fileError && <p style={{ color: 'red' }}>{fileError}</p>}
        </div>
        {isButtonClicked &&(<div>
          {results.map((employee, index) => {
            if (employee["Time Out"] !== "" && employee["Position Status"] !== "" && employee["File Number"] !== "" ) {
              return (
                <div key={index}>
                  <p>Name: {employee["Employee Name"]}</p>
                  <p>Position: {employee["Position ID"]}</p>
                </div>
              );
            }
            return null; // Returning null if the conditions are not met
          })}
        </div>)}
      </div>
    </main>
  );
};

export default Logic;
