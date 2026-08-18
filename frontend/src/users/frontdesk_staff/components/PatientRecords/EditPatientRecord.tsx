import { useState } from 'react';
import api from '../../../../lib/axios';

type Patient = {
  id: number;
  patient_id: string;
  first_name: string;
  last_name: string;
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

type EditPatientRecordProps = {
  selectedPatient: Patient | null;
  onClose: () => void;
  loadData: () => Promise<void>;
};

function EditPatientRecord({
  selectedPatient,
  onClose,
  loadData,
}: EditPatientRecordProps) {
  const [firstName, setFirstName] = useState(selectedPatient?.first_name ?? '');
  const [lastName, setLastName] = useState(selectedPatient?.last_name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(selectedPatient?.date_of_birth ?? '');
  const [sexValue, setSexValue] = useState(selectedPatient?.sex ?? '');
  const [contactNumber, setContactNumber] = useState(selectedPatient?.contact_number ?? '');
  const [emailValue, setEmailValue] = useState(selectedPatient?.email ?? '');
  const [addressValue, setAddressValue] = useState(selectedPatient?.address ?? '');
  const [emergencyContact, setEmergencyContact] = useState(selectedPatient?.emergency_contact ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>(selectedPatient?.image_url ?? '');

  // Guard: nothing to edit if no patient was selected
  if (!selectedPatient) return null;
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    // If there was an old preview, free its memory before creating a new one.
    // This DOES NOT delete the user's file.
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    // Save the file for uploading later.
    setImage(file);

    // Create a temporary blob URL so <img> can display the image immediately.
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('date_of_birth', dateOfBirth);
      formData.append('sex', sexValue);
      formData.append('contact_number', contactNumber);
      formData.append('email', emailValue);
      formData.append('address', addressValue);
      formData.append('emergency_contact', emergencyContact);
      if (image) {
        formData.append('image', image);
      }
      const response = await api.put(`/api/fdstaff/patients/${selectedPatient?.patient_id}`, formData);
      alert(response.data.message);
      await loadData();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* shadow/backdrop behind the card */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <main className="relative bg-white rounded-lg shadow-lg w-full max-w-lg">

        <div className="flex-1 bg-gray-100 p-6 space-y-3 rounded-lg">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Patient Record</h1>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}
          {preview && <img src={preview} alt="Preview" className="mt-2 max-h-32" />}

          <input
            type="text"
            placeholder="First name"
            className="w-full border rounded px-2 py-1"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last name"
            className="w-full border rounded px-2 py-1"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <select
            className="w-full border rounded px-2 py-1"
            value={sexValue}
            onChange={(e) => setSexValue(e.target.value)}
          >
            <option value="">Select sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="text"
            placeholder="Contact number"
            className="w-full border rounded px-2 py-1"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-2 py-1"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
          />
          <input
            type="text"
            placeholder="Address"
            className="w-full border rounded px-2 py-1"
            value={addressValue}
            onChange={(e) => setAddressValue(e.target.value)}
          />
          <input
            type="text"
            placeholder="Emergency contact"
            className="w-full border rounded px-2 py-1"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
          />
          <input
            className="border rounded px-2 py-1"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              className="border-2 px-3 py-1 rounded cursor-pointer hover:bg-gray-200"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="border-2 px-3 py-1 rounded bg-red-800 text-white disabled:opacity-50 hover:bg-red-900 cursor-pointer"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>

          </div>
        </div>
      </main>
    </div>
  )
}

export default EditPatientRecord