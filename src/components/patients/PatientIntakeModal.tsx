import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Patient, Sex, Medication } from '../../types';

interface PatientIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient, isNew: boolean) => void;
  initialPatient?: Patient | null;
}

export const PatientIntakeModal: React.FC<PatientIntakeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPatient,
}) => {
  const isEditing = Boolean(initialPatient);

  const [name, setName] = useState('');
  const [patientIdNumber, setPatientIdNumber] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<Sex>('Female');
  const [dob, setDob] = useState('');
  const [contact, setContact] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');

  // Clinical Tag Lists
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');

  const [existingConditions, setExistingConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState('');

  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');

  const [medications, setMedications] = useState<Medication[]>([]);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('');

  const [medicalHistoryNotes, setMedicalHistoryNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialPatient) {
      setName(initialPatient.name);
      setPatientIdNumber(initialPatient.patientIdNumber);
      setAge(initialPatient.age);
      setSex(initialPatient.sex);
      setDob(initialPatient.dob || '');
      setContact(initialPatient.contact || '');
      setRegistrationDate(initialPatient.registrationDate);
      setSymptoms(initialPatient.symptoms || []);
      setExistingConditions(initialPatient.existingConditions || []);
      setAllergies(initialPatient.allergies || []);
      setMedications(initialPatient.currentMedications || []);
      setMedicalHistoryNotes(initialPatient.medicalHistoryNotes || '');
    } else {
      // Default new patient
      setName('');
      setPatientIdNumber(`MED-${Math.floor(1000 + Math.random() * 9000)}`);
      setAge('');
      setSex('Female');
      setDob('');
      setContact('');
      setRegistrationDate(new Date().toISOString().split('T')[0]);
      setSymptoms([]);
      setExistingConditions([]);
      setAllergies([]);
      setMedications([]);
      setMedicalHistoryNotes('');
    }
    setErrors({});
  }, [initialPatient, isOpen]);

  if (!isOpen) return null;

  const handleAddSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleAddCondition = () => {
    if (conditionInput.trim()) {
      setExistingConditions([...existingConditions, conditionInput.trim()]);
      setConditionInput('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setExistingConditions(existingConditions.filter((_, i) => i !== index));
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddMedication = () => {
    if (medName.trim()) {
      setMedications([
        ...medications,
        {
          name: medName.trim(),
          dosage: medDosage.trim() || undefined,
          frequency: medFreq.trim() || undefined,
          source: 'user_intake',
        },
      ]);
      setMedName('');
      setMedDosage('');
      setMedFreq('');
    }
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Patient name is required.';
    if (!patientIdNumber.trim()) errs.patientIdNumber = 'Patient ID is required.';
    if (age === '' || Number(age) <= 0 || Number(age) > 130) errs.age = 'Please enter a valid age between 1 and 130.';
    if (!registrationDate.trim()) errs.registrationDate = 'Registration date is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const patientData: Patient = {
      id: initialPatient ? initialPatient.id : `patient-${Date.now()}`,
      name: name.trim(),
      patientIdNumber: patientIdNumber.trim(),
      age: Number(age),
      sex,
      dob: dob || undefined,
      contact: contact || undefined,
      registrationDate,
      symptoms,
      existingConditions,
      allergies,
      currentMedications: medications,
      medicalHistoryNotes: medicalHistoryNotes || undefined,
      isDemo: initialPatient?.isDemo || false,
    };

    onSave(patientData, !isEditing);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="intake-title">
      <div className="modal-dialog" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} style={{ color: 'var(--primary-600)' }} />
            <div>
              <h3 id="intake-title">{isEditing ? 'Edit Patient Intake Record' : 'New Patient Information Intake'}</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                User-provided registration data • Stored separately from report-extracted data
              </div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ maxHeight: '72vh' }}>
            {/* Section 1: Basic Info */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--slate-800)', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
                1. Basic Patient Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="patient-name">
                    Full Legal Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="patient-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Eleanor Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && <div className="form-error"><AlertCircle size={12} /> {errors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="patient-id">
                    Patient ID / MRN <span className="required-star">*</span>
                  </label>
                  <input
                    id="patient-id"
                    type="text"
                    className="form-input"
                    value={patientIdNumber}
                    onChange={(e) => setPatientIdNumber(e.target.value)}
                  />
                  {errors.patientIdNumber && <div className="form-error"><AlertCircle size={12} /> {errors.patientIdNumber}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="patient-age">
                    Age (Years) <span className="required-star">*</span>
                  </label>
                  <input
                    id="patient-age"
                    type="number"
                    min="1"
                    max="130"
                    className="form-input"
                    placeholder="e.g. 58"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  />
                  {errors.age && <div className="form-error"><AlertCircle size={12} /> {errors.age}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="patient-sex">
                    Biological Sex <span className="required-star">*</span>
                  </label>
                  <select
                    id="patient-sex"
                    className="form-select"
                    value={sex}
                    onChange={(e) => setSex(e.target.value as Sex)}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="patient-dob">
                    Date of Birth <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    id="patient-dob"
                    type="date"
                    className="form-input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="patient-contact">
                    Contact Phone / Email <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    id="patient-contact"
                    type="text"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="patient-reg-date">
                    Registration Date <span className="required-star">*</span>
                  </label>
                  <input
                    id="patient-reg-date"
                    type="date"
                    className="form-input"
                    value={registrationDate}
                    onChange={(e) => setRegistrationDate(e.target.value)}
                  />
                  {errors.registrationDate && <div className="form-error"><AlertCircle size={12} /> {errors.registrationDate}</div>}
                </div>
              </div>
            </div>

            {/* Section 2: Clinical Intake Information */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--slate-800)', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
                2. Clinical Background (Provided by Patient / User)
              </h4>

              {/* Symptoms */}
              <div className="form-group">
                <label className="form-label">Reported Symptoms</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mild fatigue, joint pain (Press Add)"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSymptom(); } }}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSymptom}>
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {symptoms.map((s, idx) => (
                    <span key={idx} className="badge" style={{ backgroundColor: '#fff1f2', color: '#9f1239', paddingRight: '0.3rem' }}>
                      {s}
                      <button type="button" onClick={() => handleRemoveSymptom(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9f1239', marginLeft: '4px' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Existing Conditions */}
              <div className="form-group">
                <label className="form-label">Existing Conditions</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Essential Hypertension, Type 2 Diabetes"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCondition(); } }}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCondition}>
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {existingConditions.map((c, idx) => (
                    <span key={idx} className="badge" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-800)', paddingRight: '0.3rem' }}>
                      {c}
                      <button type="button" onClick={() => handleRemoveCondition(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-800)', marginLeft: '4px' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div className="form-group">
                <label className="form-label" style={{ color: '#b91c1c' }}>Known Drug or Environmental Allergies</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Penicillin (Hives), Sulfa drugs"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAllergy(); } }}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddAllergy}>
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {allergies.map((a, idx) => (
                    <span key={idx} className="badge" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', paddingRight: '0.3rem' }}>
                      {a}
                      <button type="button" onClick={() => handleRemoveAllergy(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', marginLeft: '4px' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div className="form-group">
                <label className="form-label">Current Medications</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Medication Name (e.g. Lisinopril)"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Dosage (e.g. 10 mg)"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Frequency (e.g. Daily)"
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddMedication}>
                    <Plus size={14} /> Add
                  </button>
                </div>

                {medications.length > 0 && (
                  <div style={{ marginTop: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                    {medications.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: idx < medications.length - 1 ? '1px solid var(--slate-100)' : 'none', fontSize: '0.8rem' }}>
                        <div>
                          <strong>{m.name}</strong> {m.dosage ? `— ${m.dosage}` : ''} {m.frequency ? `(${m.frequency})` : ''}
                        </div>
                        <button type="button" onClick={() => handleRemoveMedication(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#be123c' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Medical History Notes */}
              <div className="form-group">
                <label className="form-label" htmlFor="patient-notes">
                  Additional Medical History / Clinical Notes <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  id="patient-notes"
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Prior surgeries, family history notes, non-smoker..."
                  value={medicalHistoryNotes}
                  onChange={(e) => setMedicalHistoryNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Complete Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
