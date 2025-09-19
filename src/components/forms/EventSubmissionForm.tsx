import React, { useState } from 'react';
import {
  Send,
  Calendar,
  MapPin,
  Users,
  Clock,
  Shield,
  Heart,
  AlertCircle,
  CheckCircle,
  User,
  Globe,
  Home,
  Monitor
} from 'lucide-react';
import { EventSubmission } from '../../services/events-api';

interface EventSubmissionFormProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const EventSubmissionForm: React.FC<EventSubmissionFormProps> = ({
  onSubmitSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<EventSubmission>({
    title: '',
    description: '',
    type: 'organizing',
    date: '',
    location: {
      type: 'hybrid',
      details: '',
      accessibilityNotes: ''
    },
    organizer: {
      name: '',
      contact: ''
    },
    registration: {
      required: false,
      link: '',
      capacity: undefined
    },
    traumaInformed: true,
    accessibilityFeatures: [],
    communityValue: 'organizing'
  });

  const [accessibilityInput, setAccessibilityInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const eventTypes = [
    { value: 'mutual-aid', label: 'Mutual Aid', icon: Heart, description: 'Direct community support and resource sharing' },
    { value: 'organizing', label: 'Community Organizing', icon: Users, description: 'Building collective power for change' },
    { value: 'education', label: 'Education', icon: Shield, description: 'Learning and skill sharing' },
    { value: 'celebration', label: 'Celebration', icon: Heart, description: 'Joy, culture, and community connection' },
    { value: 'support', label: 'Support', icon: Heart, description: 'Healing and wellness gathering' },
    { value: 'action', label: 'Direct Action', icon: Shield, description: 'Protest, advocacy, and resistance' }
  ] as const;

  const communityValues = [
    { value: 'education', label: 'Education & Learning' },
    { value: 'mutual-aid', label: 'Mutual Aid & Support' },
    { value: 'organizing', label: 'Community Organizing' },
    { value: 'celebration', label: 'Joy & Celebration' },
    { value: 'healing', label: 'Healing & Wellness' }
  ] as const;

  const locationTypes = [
    { value: 'online', label: 'Online Only', icon: Monitor },
    { value: 'in-person', label: 'In-Person Only', icon: Home },
    { value: 'hybrid', label: 'Hybrid (Online + In-Person)', icon: Globe }
  ] as const;

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof EventSubmission],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setError('');
  };

  const handleAddAccessibilityFeature = () => {
    if (accessibilityInput.trim() && !formData.accessibilityFeatures.includes(accessibilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        accessibilityFeatures: [...prev.accessibilityFeatures, accessibilityInput.trim()]
      }));
      setAccessibilityInput('');
    }
  };

  const handleRemoveAccessibilityFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      accessibilityFeatures: prev.accessibilityFeatures.filter(feature => feature !== featureToRemove)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Event description is required');
      return false;
    }
    if (!formData.date) {
      setError('Event date and time are required');
      return false;
    }
    if (!formData.location.details.trim()) {
      setError('Location details are required');
      return false;
    }
    if (!formData.organizer.name.trim()) {
      setError('Organizer name is required');
      return false;
    }
    if (formData.description.length < 50) {
      setError('Event description must be at least 50 characters long');
      return false;
    }

    // Check if date is in the future
    const eventDate = new Date(formData.date);
    const now = new Date();
    if (eventDate <= now) {
      setError('Event date must be in the future');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      // Mock API call - replace with actual submission endpoint
      const submissionData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending' as const,
        id: `event-${Date.now()}`
      };

      console.log('Submitting event for moderation:', submissionData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful submission
      setSubmitted(true);

      // Reset form after delay
      setTimeout(() => {
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }, 3000);

    } catch (error) {
      console.error('Event submission failed:', error);
      setError('Failed to submit event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Event Submitted Successfully
          </h2>
          <p className="text-gray-400 mb-6">
            Your event "{formData.title}" has been submitted for community review.
            Our organizing team will review it according to our liberation-focused guidelines.
          </p>
          <div className="bg-liberation-sovereignty-gold/10 border border-liberation-sovereignty-gold/20 rounded-lg p-4 mb-6">
            <div className="flex items-center text-liberation-sovereignty-gold mb-2">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-bold">What happens next?</span>
            </div>
            <div className="text-gray-300 text-sm space-y-1">
              <div>• Community organizers will review for liberation values</div>
              <div>• Accessibility and trauma-informed assessment</div>
              <div>• Community protection and safety validation</div>
              <div>• Typically reviewed within 24-48 hours</div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-3 px-6 rounded-lg font-bold transition-all duration-300"
          >
            Submit Another Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          Submit <span className="text-liberation-sovereignty-gold">Liberation Event</span>
        </h1>
        <p className="text-gray-400">
          Share community events that build power, support each other, and create liberation.
          All submissions undergo human review focused on community values and safety.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Event Type Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-4">
            Event Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {eventTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('type', type.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                    formData.type === type.value
                      ? 'border-liberation-sovereignty-gold bg-liberation-sovereignty-gold/10 text-liberation-sovereignty-gold'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <IconComponent className="h-5 w-5 mr-2" />
                    <span className="font-bold">{type.label}</span>
                  </div>
                  <p className="text-xs opacity-75">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-300 mb-2">
              Event Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
              placeholder="Liberation organizing meeting"
              required
            />
          </div>

          <div>
            <label htmlFor="organizer-name" className="block text-sm font-bold text-gray-300 mb-2">
              Organizer Name *
            </label>
            <div className="relative">
              <User className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="organizer-name"
                type="text"
                value={formData.organizer.name}
                onChange={(e) => handleInputChange('organizer.name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
                placeholder="Your name or organization"
                required
              />
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div>
          <label htmlFor="date" className="block text-sm font-bold text-gray-300 mb-2">
            Date and Time *
          </label>
          <div className="relative">
            <Calendar className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-3">
              Location Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {locationTypes.map((locationType) => {
                const IconComponent = locationType.icon;
                return (
                  <button
                    key={locationType.value}
                    type="button"
                    onClick={() => handleInputChange('location.type', locationType.value)}
                    className={`p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                      formData.location.type === locationType.value
                        ? 'border-liberation-sovereignty-gold bg-liberation-sovereignty-gold/10 text-liberation-sovereignty-gold'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm font-bold">{locationType.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="location-details" className="block text-sm font-bold text-gray-300 mb-2">
              Location Details *
            </label>
            <div className="relative">
              <MapPin className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <textarea
                id="location-details"
                value={formData.location.details}
                onChange={(e) => handleInputChange('location.details', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none h-20 resize-none"
                placeholder="Address, venue name, Zoom link, or meeting instructions"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="accessibility-notes" className="block text-sm font-bold text-gray-300 mb-2">
              Location Accessibility Notes
            </label>
            <textarea
              id="accessibility-notes"
              value={formData.location.accessibilityNotes || ''}
              onChange={(e) => handleInputChange('location.accessibilityNotes', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none h-16 resize-none"
              placeholder="Wheelchair accessible, ASL interpretation available, etc."
            />
          </div>
        </div>

        {/* Event Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-gray-300 mb-2">
            Event Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none h-32 resize-none"
            placeholder="Describe your event, its purpose, agenda, and what participants can expect. Focus on liberation values and community benefit. Minimum 50 characters."
            required
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Minimum 50 characters</span>
            <span>{formData.description.length} characters</span>
          </div>
        </div>

        {/* Community Value */}
        <div>
          <label htmlFor="community-value" className="block text-sm font-bold text-gray-300 mb-2">
            Primary Community Value *
          </label>
          <select
            id="community-value"
            value={formData.communityValue}
            onChange={(e) => handleInputChange('communityValue', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
            required
          >
            {communityValues.map(value => (
              <option key={value.value} value={value.value}>
                {value.label}
              </option>
            ))}
          </select>
        </div>

        {/* Registration */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              id="registration-required"
              type="checkbox"
              checked={formData.registration.required}
              onChange={(e) => handleInputChange('registration.required', e.target.checked)}
              className="w-4 h-4 text-liberation-sovereignty-gold bg-gray-800 border-gray-600 rounded focus:ring-liberation-sovereignty-gold focus:ring-2"
            />
            <label htmlFor="registration-required" className="text-sm font-bold text-gray-300">
              Registration Required
            </label>
          </div>

          {formData.registration.required && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="registration-link" className="block text-sm font-bold text-gray-300 mb-2">
                  Registration Link
                </label>
                <input
                  id="registration-link"
                  type="url"
                  value={formData.registration.link || ''}
                  onChange={(e) => handleInputChange('registration.link', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
                  placeholder="https://example.com/register"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-bold text-gray-300 mb-2">
                  Capacity (Optional)
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.registration.capacity || ''}
                  onChange={(e) => handleInputChange('registration.capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
                  placeholder="Maximum attendees"
                />
              </div>
            </div>
          )}
        </div>

        {/* Accessibility Features */}
        <div>
          <label htmlFor="accessibility-features" className="block text-sm font-bold text-gray-300 mb-2">
            Accessibility Features
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={accessibilityInput}
              onChange={(e) => setAccessibilityInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAccessibilityFeature())}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
              placeholder="e.g., ASL interpretation, wheelchair accessible, quiet space"
            />
            <button
              type="button"
              onClick={handleAddAccessibilityFeature}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Shield className="h-4 w-4" />
            </button>
          </div>
          {formData.accessibilityFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.accessibilityFeatures.map((feature, index) => (
                <span
                  key={index}
                  className="bg-liberation-sovereignty-gold/20 text-liberation-sovereignty-gold px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveAccessibilityFeature(feature)}
                    className="ml-2 text-liberation-sovereignty-gold/70 hover:text-liberation-sovereignty-gold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Trauma-Informed */}
        <div className="flex items-center space-x-3">
          <input
            id="trauma-informed"
            type="checkbox"
            checked={formData.traumaInformed}
            onChange={(e) => handleInputChange('traumaInformed', e.target.checked)}
            className="w-4 h-4 text-liberation-sovereignty-gold bg-gray-800 border-gray-600 rounded focus:ring-liberation-sovereignty-gold focus:ring-2"
          />
          <label htmlFor="trauma-informed" className="text-sm font-bold text-gray-300">
            This event follows trauma-informed practices
          </label>
        </div>

        {/* Contact Information */}
        <div>
          <label htmlFor="organizer-contact" className="block text-sm font-bold text-gray-300 mb-2">
            Contact Information (Optional)
          </label>
          <input
            id="organizer-contact"
            type="text"
            value={formData.organizer.contact || ''}
            onChange={(e) => handleInputChange('organizer.contact', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
            placeholder="Email, phone, or other contact method"
          />
        </div>

        {/* Community Guidelines */}
        <div className="bg-liberation-sovereignty-gold/10 border border-liberation-sovereignty-gold/20 rounded-lg p-4">
          <h4 className="text-liberation-sovereignty-gold font-bold text-sm mb-2">Community Event Guidelines</h4>
          <div className="text-gray-400 text-xs space-y-1">
            <div>• Events should center liberation values and community empowerment</div>
            <div>• Maintain accessibility and trauma-informed practices</div>
            <div>• Foster safe spaces for all community members</div>
            <div>• Focus on collective action and mutual support</div>
            <div>• Respect cultural authenticity and avoid appropriation</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 flex items-center text-red-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-3 px-6 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting for Review...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit for Community Review
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-3 border-2 border-gray-600 text-gray-300 hover:border-liberation-sovereignty-gold hover:text-liberation-sovereignty-gold rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EventSubmissionForm;