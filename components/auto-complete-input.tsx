"use client";
import { useEffect, useState } from "react";

const AutoCompleteInput = ({ options, valueKey, labelKey }) => {
  const [inputValue, setInputValue] = useState("");
  const [q, setQ] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    setQ(inputValue);
  };
  useEffect(() => {
    const filtered = options.filter((option) =>
      option[labelKey].toLowerCase().includes(q.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [q, options]);

  const handleOptionClick = (option) => {
    setInputValue(option[labelKey]);
    setFilteredOptions([option]);
  };
  const [focus, setFocus] = useState(false);
  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setTimeout(() => {
            setQ("");
            setFocus(false);
          }, 300);
        }}
        placeholder="Search..."
        className="border rounded px-4 py-2 w-full focus:outline-none focus:ring focus:border-blue-300"
      />
      {filteredOptions.length > 0 && focus && (
        <ul className="absolute z-10 mt-2 w-full bg-white border rounded shadow-md">
          {filteredOptions.map((option) => (
            <li
              key={option[valueKey]}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                handleOptionClick(option);
              }}
            >
              {option[labelKey]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoCompleteInput;
