const sleep = () => {
  setTimeout(() => sleep(), 50);
};
sleep();
