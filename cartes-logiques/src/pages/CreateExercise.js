import React from 'react';
import Game from '../components/Game';
import Navigation from '../components/Navigation';

const CreateExercise = () => {
  return (
    <div className="create">
      <Navigation/>    
      <Game mode="create"/>      
    </div>
  );
};

export default CreateExercise;