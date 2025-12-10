import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminBad = () => {
  const [quotes, setQuotes] = useState([]);
  const [error] = useState("");

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuotes = async () => {};

  return 0;
};
