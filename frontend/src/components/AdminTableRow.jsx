const { useState } = window.React;

export const AdminTableRow = ({ paciente, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fecha_cita: paciente.fecha_cita ? paciente.fecha_cita.split('T')[0] : '',
    estado: paciente.estado || 'Pendiente'
  });

  const handleSave = () => {
    onUpdate(paciente.id, editData);
    setIsEditing(false);
  };

  return (
    <tr>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{paciente.nombre}</td>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{paciente.email}</td>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
        {isEditing ? (
          <input type="date" value={editData.fecha_cita} onChange={(e) => setEditData({...editData, fecha_cita: e.target.value})} />
        ) : (
          paciente.fecha_cita ? paciente.fecha_cita.split('T')[0] : ''
        )}
      </td>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
        {isEditing ? (
          <select value={editData.estado} onChange={(e) => setEditData({...editData, estado: e.target.value})}>
            <option value="Pendiente">Pendiente</option>
            <option value="Atendido">Atendido</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        ) : (
          <span style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: paciente.estado === 'Atendido' ? '#d4edda' : '#fff3cd' }}>
            {paciente.estado}
          </span>
        )}
      </td>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
        {isEditing ? (<button className="btn-primary" onClick={handleSave} style={{ marginRight: '8px' }}>Guardar</button>) 
                  : (<button className="btn-outline" onClick={() => setIsEditing(true)} style={{ marginRight: '8px' }}>Atender</button>)}
        <button className="btn-outline" style={{ color: 'red', borderColor: 'red' }} onClick={() => onDelete(paciente.id)}>Borrar</button>
      </td>
    </tr>
  );
};