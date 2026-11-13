"""Render our own gentle piano-style arrangement of Happy Birthday.
No samples, commercial recordings, external packages, or network access.
"""
from pathlib import Path
import math
import random
import struct
import wave

RATE = 32000
BEAT = 60 / 78
notes = {'G3': 196.00, 'A3': 220.00, 'B3': 246.94, 'C4': 261.63,
         'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00}
phrases = [
    [('G3', .75), ('G3', .25), ('A3', 1), ('G3', 1), ('C4', 1), ('B3', 2)],
    [('G3', .75), ('G3', .25), ('A3', 1), ('G3', 1), ('D4', 1), ('C4', 2)],
    [('G3', .75), ('G3', .25), ('G4', 1.5), ('E4', .5), ('C4', 1), ('B3', 1), ('A3', 1)],
    [('F4', .75), ('F4', .25), ('E4', 1), ('C4', 1), ('D4', 1), ('C4', 2)],
]
# A quiet breath before each repeat keeps the loop unhurried.
events = []
t = 1.0
for phrase in phrases:
    for name, beats in phrase:
        events.append((t, notes[name], .23, 3.3))
        t += beats * BEAT
    t += .20
# Widely spaced, very quiet broken chords support the melody.
chords = [(130.81,164.81,196), (98,123.47,146.83),
          (110,130.81,164.81), (130.81,164.81,196)]
phrase_start = 1.0
for phrase, chord in zip(phrases, chords):
    for j, frequency in enumerate(chord):
        events.append((phrase_start + .25 + j*.23, frequency, .075, 4.8))
    phrase_start += sum(beats for _, beats in phrase)*BEAT + .20
end = t + 4
frames = int(end*RATE)
buffer = [0.0]*frames
random.seed(7)
# Soft attack and subdued overtones avoid a piercing bell-like sound.
for start, frequency, level, length in events:
    base = int(start*RATE)
    for k in range(int(length*RATE)):
        if base+k >= frames: break
        d=k/RATE
        attack=1-math.exp(-d*95)
        release=min(1,(length-d)/.45)
        tone=0
        for harmonic, weight, decay in [(1,1,1.05),(2,.22,1.8),(3,.07,2.6),(4,.025,3.4)]:
            tone += weight*math.exp(-d*decay)*math.sin(2*math.pi*frequency*harmonic*d)
        buffer[base+k] += tone*attack*release*level
# A subtle stereo room tail, without an endless ambient drone.
output=Path(__file__).resolve().parents[1]/'public/music/happy-birthday-piano.wav'
with wave.open(str(output),'wb') as stream:
    stream.setnchannels(2);stream.setsampwidth(2);stream.setframerate(RATE)
    data=bytearray()
    for i, dry in enumerate(buffer):
        left=dry;right=dry*.96
        for delay, gain in [(.13,.10),(.29,.065),(.47,.035)]:
            a=i-int(delay*RATE)
            b=i-int((delay+.023)*RATE)
            if a>=0:left+=buffer[a]*gain
            if b>=0:right+=buffer[b]*gain
        fade=min(1,i/RATE,(frames-i)/RATE)
        data.extend(struct.pack('<hh',int(math.tanh(left)*fade*26000),int(math.tanh(right)*fade*26000)))
    stream.writeframes(data)
print(f'Created {output.name}: {end:.1f}s, gentle piano-style instrumental')
