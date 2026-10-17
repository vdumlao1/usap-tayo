import { useSpeech } from '../context/SpeechContext.jsx';
import { useRecordings } from '../context/RecordingsContext.jsx';
import { MAX_RECORDING_SECONDS } from '../lib/recordings.js';
import Icon from './Icon.jsx';

/*
  Audio for one phrase or dialogue line.

  Play button, in order of preference:
    1. A family recording you made for this phrase (most accurate!)
    2. Pre-generated audio from a Tagalog-trained computer voice (public/audio/tts)
    3. A Filipino text-to-speech voice, if the device has one
    4. A "stand-in" voice, only if you turned that on in the Guide
  If none is available, there's no play button — the written guide is always shown.

  Record button (when `recordable`): ask a family member to say it, and save
  their voice for this phrase. Recording again replaces the old one.
*/
export default function AudioControls({ text, label, audioKey, recordable = false, compact = false }) {
  const speech = useSpeech();
  const rec = useRecordings();

  const hasRecording = Boolean(audioKey) && rec.has(audioKey);
  const isRecording = Boolean(audioKey) && rec.recordingKey === audioKey;
  const name = label ?? text;
  const error = rec.error && rec.error.key === audioKey ? rec.error.message : null;

  const generatedUrl = speech.generatedUrl(audioKey);

  let play = null;
  if (hasRecording) {
    const playing = rec.playingKey === audioKey;
    play = (
      <button
        type="button"
        className={`speak-btn speak-btn--family ${compact ? 'speak-btn--compact' : ''} ${playing ? 'is-speaking' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          rec.play(audioKey);
        }}
        aria-label={`Play family recording of “${name}”`}
        title="Play your family recording"
      >
        <Icon name="heart" size={compact ? 16 : 18} />
        {!compact && <span>Family</span>}
      </button>
    );
  } else if (generatedUrl) {
    const id = `tts:${audioKey}`;
    const playing = rec.playingKey === id;
    play = (
      <button
        type="button"
        className={`speak-btn ${compact ? 'speak-btn--compact' : ''} ${playing ? 'is-speaking' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          rec.playUrl(id, generatedUrl, audioKey);
        }}
        aria-label={`Listen to “${name}” (Tagalog computer voice)`}
        title="Tagalog computer voice. Close, but a family recording is better."
      >
        <Icon name="speaker" size={compact ? 16 : 18} />
        {!compact && <span>Listen</span>}
      </button>
    );
  } else if (speech.canSpeak) {
    const approximate = !speech.tagalogVoice;
    const speaking = speech.speakingText === text;
    play = (
      <button
        type="button"
        className={`speak-btn ${compact ? 'speak-btn--compact' : ''} ${speaking ? 'is-speaking' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          rec.stopPlayback();
          speech.speak(text);
        }}
        aria-label={`Listen to “${name}”${approximate ? ' (computer stand-in voice, accent is not accurate)' : ' (computer voice)'}`}
        title={approximate ? 'Stand-in computer voice — the accent is not accurate. Trust the written guide.' : `Computer voice: ${speech.tagalogVoice.name}`}
      >
        <Icon name="speaker" size={compact ? 16 : 18} />
        {!compact && <span>{approximate ? 'Listen ≈' : 'Listen'}</span>}
      </button>
    );
  }

  const showRecord = recordable && audioKey && rec.supported;

  return (
    <span className="audio">
      <span className="audio__btns">
        {play}
        {showRecord &&
          (isRecording ? (
            <button
              type="button"
              className={`rec-btn is-recording ${compact ? 'rec-btn--compact' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                rec.stopRecording();
              }}
              aria-label={`Stop recording (${rec.elapsed} of ${MAX_RECORDING_SECONDS} seconds)`}
            >
              <Icon name="stop" size={16} />
              <span className="rec-btn__time">
                0:{String(rec.elapsed).padStart(2, '0')}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className={`rec-btn ${compact ? 'rec-btn--compact' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                rec.startRecording(audioKey);
              }}
              disabled={Boolean(rec.recordingKey)}
              aria-label={`${hasRecording ? 'Re-record' : 'Record'} a family member saying “${name}”`}
              title={hasRecording ? 'Record again (replaces the old recording)' : 'Record a family member saying this'}
            >
              <Icon name="mic" size={16} />
              {!compact && <span>{hasRecording ? 'Re-record' : 'Record'}</span>}
            </button>
          ))}
        {showRecord && hasRecording && !isRecording && (
          <button
            type="button"
            className="rec-btn rec-btn--compact rec-btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              rec.remove(audioKey);
            }}
            aria-label={`Delete the recording of “${name}”`}
            title="Delete recording"
          >
            <Icon name="trash" size={15} />
          </button>
        )}
      </span>
      {error && (
        <span className="audio__error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
