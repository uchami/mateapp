import EcuacionGame from './EcuacionGame'
import { generateLevel3 } from './EcuacionEngine'
import { useLang } from '../../i18n/LanguageContext'

export default function Nivel3() {
  const { t } = useLang()
  return (
    <EcuacionGame
      level={3}
      generator={generateLevel3}
      title={t.ecuaciones.level3.title}
      tutorialSlides={t.ecuaciones.level3.slides}
    />
  )
}
