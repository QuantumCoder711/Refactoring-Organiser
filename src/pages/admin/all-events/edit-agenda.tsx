import React from 'react'
import { useParams } from 'react-router-dom';

const EditAgenda:React.FC = () => {
    const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Edit Agenda</h1>
    </div>
  )
}

export default EditAgenda;
