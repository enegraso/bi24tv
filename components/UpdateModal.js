import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

export default function UpdateModal({ visible, version, apkUrl, changelog, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const fileUri = FileSystem.cacheDirectory + `app-update-${version}.apk`;
      const downloadResumable = FileSystem.createDownloadResumable(
        apkUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const p = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setProgress(Math.round(p * 100));
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      const cUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: cUri,
        flags: 1,
        type: 'application/vnd.android.package-archive',
      });
    } catch (e) {
      console.log('Download error:', e);
      setError('No se pudo descargar. Intentá de nuevo.');
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Nueva versión disponible</Text>
          <Text style={styles.version}>v{version}</Text>
          {changelog ? <Text style={styles.changelog}>{changelog}</Text> : null}

          {downloading ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <View style={styles.buttons}>
            {!downloading && (
              <Pressable style={[styles.btn, styles.btnUpdate]} onPress={handleDownload}>
                <Text style={styles.btnText}>Actualizar</Text>
              </Pressable>
            )}
            <Pressable style={[styles.btn, styles.btnLater]} onPress={onClose}>
              <Text style={[styles.btnText, { color: '#ccc' }]}>Ahora no</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 28,
    width: '85%',
    maxWidth: 380,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  version: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 12,
  },
  changelog: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  btnUpdate: {
    backgroundColor: '#4a90d9',
  },
  btnLater: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
