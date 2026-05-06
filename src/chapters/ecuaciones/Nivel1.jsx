import EcuacionGame from './EcuacionGame'
import { generateLevel1 } from './EcuacionEngine'
import { useLang } from '../../i18n/LanguageContext'

export default function Nivel1() {
  const { t } = useLang()
  return (
    <EcuacionGame
      level={1}
      generator={generateLevel1}
      title={t.ecuaciones.level1.title}
      tutorialSlides={t.ecuaciones.level1.slides}
    />
  )
}
