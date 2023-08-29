import { useDebounce } from "@/hooks/use-debounce";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  options?: any[];
  value?: any;
  onChange?;
  itemText?;
  itemValue?;
  transformValue?;
  transformText?;
}
export default function Autocomplete({
  options,
  value,
  onChange,
  itemText = "name",
  itemValue = "id",
}: Props) {
  const [showOptions, setShowOptions] = useState(false);
  const [cursor, setCursor] = useState(-1);
  function __options(items) {
    return items?.map((o) => {
      if (typeof o === "string") return { id: o, text: o, data: o };
      return {
        value: o?.[itemValue],
        text: o?.[itemText],
        data: o,
      };
    });
  }
  const [items, setItems] = useState(__options(options) || []);
  const [filters, setFilters] = useState(__options(options) || []);
  const ref = useRef();
  function getItem(value, by: "text" | "value" = "text") {
    return items.find((o) => o?.[by] == value);
  }

  function getItemText(value) {
    return getItem(value)?.text;
  }
  const [data, setData] = useState({
    text: getItemText(value),
    value,
    data: getItem(value)?.data,
  });
  useEffect(() => {
    setItems(__options(options));
    setData({
      text: getItemText(value),
      value,
      data: getItem(value)?.data,
    });
    filteredOptions();
  }, [options]);

  const select = (option) => {
    onChange(option);
    setData({
      text: option.text,
      value: option.value,
      data: option?.data,
    });
    setShowOptions(false);
  };

  const handleChange = (text) => {
    // onChange(text);
    setData({
      text,
      value: [data.value],
      data: [data.data],
    });
    setCursor(-1);
    if (!showOptions) {
      setShowOptions(true);
    }
    filteredOptions();
  };
  const debouncedQuery = useDebounce(data.text, 800);
  useEffect(() => {}, [debouncedQuery]);

  const filteredOptions = () => {
    const escapedText = data?.text?.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    // Create a regex pattern to match the search string anywhere in the text
    const pattern = new RegExp(escapedText, "i");
    const filteredOptions = items.filter((option) => pattern.test(option.text));
    setFilters(filteredOptions);
    // return __options(options).filter(
    //   (option) => option.text.includes(data?.text) || !data?.text
    //   );
  };

  const moveCursorDown = () => {
    if (cursor < filteredOptions.length - 1) {
      setCursor((c) => c + 1);
    }
  };

  const moveCursorUp = () => {
    if (cursor > 0) {
      setCursor((c) => c - 1);
    }
  };

  const handleNav = (e) => {
    switch (e.key) {
      case "ArrowUp":
        moveCursorUp();
        break;
      case "ArrowDown":
        moveCursorDown();
        break;
      case "Enter":
        if (cursor >= 0 && cursor < filteredOptions.length) {
          select(filteredOptions[cursor]);
        }
        break;
    }
  };

  useEffect(() => {
    const listener = (e) => {
      if (!(ref?.current as any)?.contains(e.target)) {
        setShowOptions(false);
        setCursor(-1);
      }
    };

    document.addEventListener("click", listener);
    document.addEventListener("focusin", listener);
    return () => {
      document.removeEventListener("click", listener);
      document.removeEventListener("focusin", listener);
    };
  }, []);

  return (
    <div className="relative z-[9999] w-64 " ref={ref as any}>
      <input
        type="text"
        className="w-full border-2 px-4 py-2 outline-none rounded-lg"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setShowOptions(true)}
        onKeyDown={handleNav}
      />

      <ul
        className={`absolute w-full bg-white z-[9999] rounded-lg shadow-lg ${!showOptions &&
          "hidden"} select-none`}
      >
        {items.length > 0 ? (
          items.map((option, i, arr) => {
            let className = "px-4 hover:bg-gray-100 ";

            if (i === 0) className += "pt-2 pb-1 rounded-t-lg";
            else if (i === arr.length) className += "pt-1 pb-2 rounded-b-lg";
            else if (i === 0 && arr.length === 1)
              className += "py-2 rounded-lg";
            else className += "py-1";

            if (cursor === i) {
              className += " bg-gray-100";
            }

            return (
              <li
                className={className}
                key={option.value}
                onClick={() => select(option)}
              >
                {option.text}
              </li>
            );
          })
        ) : (
          <li className="px-4 py-2 text-gray-500">No results</li>
        )}
      </ul>
    </div>
  );
}
