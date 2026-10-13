/**
 * Lee un archivo de imagen y lo reduce con un canvas.
 *
 * La imagen se limita a `anchoMaximo` píxeles de ancho y se convierte a JPEG
 * (calidad 0.8) como data URL, para que quepa en localStorage, cuyo límite
 * ronda los 5 MB.
 *
 * @returns data URL en formato JPEG
 */
export function reducirImagen(archivo: File, anchoMaximo: number): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onerror = () => rechazar(lector.error);
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => rechazar(new Error('No se pudo leer la imagen'));
      img.onload = () => {
        const escala = Math.min(1, anchoMaximo / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolver(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  });
}
