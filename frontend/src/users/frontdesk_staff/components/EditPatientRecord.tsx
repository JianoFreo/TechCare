import React from 'react'

type Patient = {
  id: number;
  patient_id: string;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  date_of_birth: string;
  sex: string;
  contact_number: string;
  email: string;
  address: string;
  emergency_contact: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

type EditPatientRecordProps = Patient & {
  onClose: () => void;
};

function EditPatientRecord({
  id,
  patient_id, first_name,
  last_name, middle_initial,
  date_of_birth,
  sex,
  contact_number,
  email,
  address,
  emergency_contact,
  image_url,
  created_at,
  updated_at,
  onClose,
}: EditPatientRecordProps) {

  const [firstName, setFirstName] = React.useState(first_name);
  const [lastName, setLastName] = React.useState(last_name);
  const [middleInitial, setMiddleInitial] = React.useState(middle_initial || '');
  const [dateOfBirth, setDateOfBirth] = React.useState(date_of_birth);
  const [sexValue, setSexValue] = React.useState(sex);
  const [contactNumber, setContactNumber] = React.useState(contact_number || '');
  const [emailValue, setEmailValue] = React.useState(email || '');
  const [addressValue, setAddressValue] = React.useState(address || '');
  const [emergencyContact, setEmergencyContact] = React.useState(emergency_contact || '');
  const [imageUrl, setImageUrl] = React.useState(image_url || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* shadow/backdrop behind the card */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <main className="relative bg-white">
        <div className="flex-1 bg-gray-100 p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Patient Record</h1>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <input type="text" value={middleInitial} onChange={(e) => setMiddleInitial(e.target.value)} />
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          <select value={sexValue} onChange={(e) => setSexValue(e.target.value)}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
          <input type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} />
          <input type="text" value={addressValue} onChange={(e) => setAddressValue(e.target.value)} />
          <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
      </main>
    </div>
  )
}

export default EditPatientRecord