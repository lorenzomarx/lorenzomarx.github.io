#!/bin/bash

function display_menu {
  echo "==============================="
  figlet "Calculator" | toilet --gay -f term -F border
  echo "==============================="
  echo "1. Add"
  echo "2. Subtract"
  echo "3. Multiply"
  echo "4. Divide"
  echo "5. Exit"
  echo "==============================="
}

function add {
  echo "Enter two numbers to add:"
  read num1
  read num2
  sum=$((num1 + num2))
  figlet "Result: $sum" | toilet --gay -f term -F border | lolcat
}

function subtract {
  echo "Enter two numbers to subtract:"
  read num1
  read num2
  difference=$((num1 - num2))
  figlet "Result: $difference" | toilet --gay -f term -F border | lolcat
}

function multiply {
  echo "Enter two numbers to multiply:"
  read num1
  read num2
  product=$((num1 * num2))
  figlet "Result: $product" | toilet --gay -f term -F border | lolcat
}

function divide {
  echo "Enter two numbers to divide:"
  read num1
  read num2
  if (( $(echo "$num2 == 0" | bc -l) )); then
    figlet "Error: Division by zero" | toilet --gay -f term -F border | lolcat
  else
    quotient=$(echo "scale=2;$num1 / $num2" | bc -l)
    figlet "Result: $quotient" | toilet --gay -f term -F border | lolcat
  fi
}

while true; do
  display_menu
  read choice
  case $choice in
    1) add ;;
    2) subtract ;;
    3) multiply ;;
    4) divide ;;
    5) break ;;
    *) figlet "Invalid option" | toilet --gay -f term -F border | lolcat ;;
  esac
done

figlet "Thank you for using the Calculator!" | toilet --gay -f term -F border | lolcat
