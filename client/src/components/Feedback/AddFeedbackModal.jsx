import { MessageSquare, Upload, X, Play, Pause, Trash2, Mic, MicOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { addFeedbackFetch, updateFeedbackFetch, generateSignedUrlFetch, uploadAudioToS3, selectSignedUrl, selectUploadSuccess } from '../../store/slices/feedbackSlice';
import { fetchClients, selectClients, selectClientsLoading } from '../../store/slices/clientSlice';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Badge } from '../ui';
const AddFeedbackModal = ({ isOpen, onClose, feedback = null }) => {
  const dispatch = useDispatch();
  const [selectedClient, setSelectedClient] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      client: '',
      lead: 'Green',
      products: '',
      quantity: 1,
      notes: '',
      audio: null
    }
  });

  // Redux selectors
  const clients = useSelector(selectClients);
  const clientsLoading = useSelector(selectClientsLoading);
  const signedUrl = useSelector(selectSignedUrl);
  const uploadSuccess = useSelector(selectUploadSuccess);

  // Watch form values
  const watchedValues = watch();

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchClients());

      if (feedback) {
        setValue('client', feedback.client?._id || '');
        setValue('lead', feedback.lead || 'Green');
        setValue('products', feedback.products || '');
        setValue('quantity', feedback.quantity || 1);
        setValue('notes', feedback.notes || '');
        setSelectedClient(feedback.client?._id || '');

        if (feedback.audio?.key) {
          setAudioUrl(feedback.audio.url);
        }
      } else {
        reset();
        setSelectedClient('');
        setAudioFile(null);
        setAudioUrl(null);
        setAudioBlob(null);
      }
    }
  }, [isOpen, feedback, dispatch, setValue, reset]);

  const handleClientChange = (clientId) => {
    setSelectedClient(clientId);
    setValue('client', clientId);
  };

  const handleLeadChange = (lead) => {
    setValue('lead', lead);
  };

  const getLeadBadgeVariant = (lead) => {
    switch (lead) {
      case 'Red': return 'destructive';
      case 'Green': return 'default';
      case 'Orange': return 'secondary';
      default: return 'outline';
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        setAudioBlob(file);

        // Auto-upload to AWS
        try {
          setIsUploading(true);
          const audioData = await handleAudioUpload(file);
          setValue('audio', audioData);
          toast.success('Audio uploaded successfully');
        } catch (error) {
          toast.error('Failed to upload audio');
          console.error('Upload error:', error);
        } finally {
          setIsUploading(false);
        }
      } else {
        toast.error('Please select an audio file');
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const audioFile = new File([blob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(audioFile);
        stream.getTracks().forEach(track => track.stop());

        // Auto-upload to AWS
        try {
          setIsUploading(true);
          const audioData = await handleAudioUpload(audioFile);
          setValue('audio', audioData);
          toast.success('Audio recorded and uploaded successfully');
        } catch (error) {
          toast.error('Failed to upload recorded audio');
          console.error('Upload error:', error);
        } finally {
          setIsUploading(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to start recording');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
        setIsPlaying(false);
      } else {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsPlaying(false);
          setAudioElement(null);
        };
        audio.play();
        setAudioElement(audio);
        setIsPlaying(true);
      }
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setValue('audio', null);
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
      setIsPlaying(false);
    }
  };

  const handleAudioUpload = async (file) => {
    try {
      setIsUploading(true);

      // Step 1: Get signed URL
      const signedUrlResult = await dispatch(generateSignedUrlFetch({ 
        fileName: file.name, 
        fileType: file.type 
      })).unwrap();

      if (!signedUrlResult) {
        throw new Error('Failed to get signed URL');
      }

      const { signedUrl: uploadUrl, key } = signedUrlResult;

      // Step 2: Upload to S3
      const uploadResult = await dispatch(uploadAudioToS3({ 
        file, 
        signedUrl: uploadUrl 
      })).unwrap();

      if (!uploadResult.success) {
        throw new Error('Failed to upload audio');
      }

      return { key, originalName: file.name };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const feedbackData = {
        ...data,
        client: selectedClient,
        quantity: parseInt(data.quantity),
        audio: data.audio || null
      };

      if (feedback) {
        await dispatch(updateFeedbackFetch({ id: feedback._id, data: feedbackData })).unwrap();
        toast.success('Feedback updated successfully');
      } else {
        await dispatch(addFeedbackFetch(feedbackData)).unwrap();
        toast.success('Feedback created successfully');
      }

      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save feedback');
    }
  };

  const handleClose = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
      setIsPlaying(false);
    }
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {feedback ? 'Edit Feedback' : 'Add New Feedback'}
          </DialogTitle>
          <DialogDescription>
            {feedback ? 'Update the feedback information' : 'Create a new client feedback record'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Client *</label>
              <Select value={selectedClient} onValueChange={handleClientChange}>
                <SelectTrigger className={errors.client ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>No clients available</SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.client && (
                <p className="text-sm text-red-500">{errors.client.message}</p>
              )}
            </div>

            {/* Lead Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Lead Status *</label>
              <Select value={watchedValues.lead} onValueChange={handleLeadChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Red">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Red</Badge>
                      <span>High Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Orange">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">Orange</Badge>
                      <span>Medium Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Green">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Green</Badge>
                      <span>Low Priority</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Products */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Products *</label>
              <Input
                {...register('products', { required: 'Products is required' })}
                placeholder="Enter products discussed"
                className={errors.products ? 'border-red-500' : ''}
              />
              {errors.products && (
                <p className="text-sm text-red-500">{errors.products.message}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quantity *</label>
              <Input
                type="number"
                min="0"
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be 0 or greater' }
                })}
                placeholder="Enter quantity"
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <Textarea
              {...register('notes')}
              placeholder="Enter additional notes..."
              rows={3}
            />
          </div>

          {/* Audio Recording Section */}
          <div className="space-y-4 border-t pt-4">
            <label className="text-sm font-medium text-gray-700">Audio Recording</label>

            <div className="space-y-3">
              {/* Audio Controls */}
              <div className="flex items-center gap-3">
                {!audioUrl ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={isRecording ? stopRecording : startRecording}
                      className="flex items-center gap-2"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Start Recording
                        </>
                      )}
                    </Button>

                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={playAudio}
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {isPlaying ? 'Pause' : 'Play'} Audio
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeAudio}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {audioUrl && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      Uploading audio to AWS...
                    </div>
                  ) : watchedValues.audio ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Audio uploaded successfully
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Audio ready for upload
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !selectedClient}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {audioUrl ? 'Uploading Audio...' : 'Saving...'}
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  {feedback ? 'Update Feedback' : 'Create Feedback'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFeedbackModal;